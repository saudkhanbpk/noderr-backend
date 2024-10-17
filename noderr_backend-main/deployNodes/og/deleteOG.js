import { Client } from "ssh2";



async function run_commands( state , commands ){
	const server_connection = state.server_connections
	let responce = new Promise((resolve , reject)=>{
		// making ssh connection with server
		const server_conn = new Client();
		// listeners
		server_conn.on("ready" , ()=>{
			execute_commands(server_conn , commands  , state )
				.then(() => {
					server_conn.end();
					resolve(); 
				})
				.catch((error)=>{
					console.log(`Commands Execution Failed : ${error}`)
					server_conn.end();
					reject(error)
				})

		})
		.on("error" , (error)=>{
			console.log(`Server Connection Failed : ${error}`)
			server_conn.end();
			reject(error)
		})
		.connect( server_connection );
	})
	return responce
}

async function execute_commands(conn, commands , state = null) {
	for (const command of commands) {
		if ( command.platform_specific == false){
			if(command.label == "function_call"){
				let fn = state.function_map[ command.cmd ]
				let resp = await fn( state )
			}
			else{
				await executeCommand(conn, command.cmd , command.label , state);				
			}
		}
		else{
            let contains_platform = Object.keys(command.cmd).includes(state.platform?.toLowerCase() );
            let contains_all_platforms = Object.keys(command.cmd).includes( "ALL" );

			if ( (state.platform && contains_platform ) || contains_all_platforms )  {
				let platform_commands = command.cmd[ state.platform.toLowerCase() ] ? command.cmd[ state.platform.toLowerCase() ] : command.cmd[ "ALL" ]
                if (platform_commands){
                    for (const platfrom_command of platform_commands){
                        if(platfrom_command.label == "function_call"){
                            let fn = state.function_map[ platfrom_command.cmd ]
                            let resp = await fn( conn ,state )
                        }
                        else{
                            await executeCommand(conn, platfrom_command.cmd , platfrom_command.label , state);						
                        }						
                    }    
                }
			}
			else{
				console.log("Platform Not Found")
				break;
			}
		}
	}
}

async function executeCommand(conn, command , label  , state = null) {
    if(label == "generate_zip_from_platform"){
        command = command.replace("<platform>" , state.platform.toLowerCase()).replace("<arch>" , state.architecture);
    }

    console.log(`Executing command: ${command} ... Label : ${label}`);

	return new Promise((resolve, reject) => {
		let platform = null;
		let architecture = null;
		conn.exec(command, (err, stream) => {
			if (err) { reject(err) }
			stream
			.on("close", (code, signal) => {
				console.log(`Command '${command}' exited with code ${code}`);
				resolve(); 
			})
			.on("data", (data) => {
				let command_output = data.toString();
				if (label == "platform"){
					platform = command_output.split('\n').map(line => line.trim())[0];	
					platform && state ? state.platform = platform : ""
                    console.log(command_output)

				}
				else if (label == "architecture"){
					architecture = command_output.split('\n').map(line => line.trim())[0];	
					architecture && state ? state.architecture = architecture : ""
					console.log(command_output)
                }
                
				else if (label == "log_output_command"){
					console.log(command_output)
				}
				

			})
			.stderr.on("data", (data) => {
				console.log(data.toString())
			});

		});
	});
}



const deleteZeroGStorageNode = async (availableVm) => {
    let successedStatus = false;
    
    const FOLDER_PATH = "deployNodes"
    const NODE_NAME = "zerog_storage"


    const state = {
        server_connections : {
            host: availableVm.vm_ip,
            port: 22, 
            username: availableVm.vm_username,
            password: availableVm.vm_password,
        },
        systemctl_file_path : `/etc/systemd/system/${NODE_NAME}_node.service`,
    }
    
    
    
    
    const build_commands = [
        { cmd: 'uname -s', label: 'platform' , platform_specific : false },
        { cmd: 'uname -m', label: 'architecture' , platform_specific : false },
   
        // Stop and delete Running node
        { cmd : `sudo -S <<< '${availableVm.vm_password}' systemctl stop ${NODE_NAME}_node.service` , label : "log_output_command" , platform_specific : false},
        { cmd : `sudo -S <<< '${availableVm.vm_password}' rm ${state.systemctl_file_path}` , label : "log_output_command" , platform_specific : false},

        // Delete installed dependecies and dir
        { cmd : `sudo -S <<< '${availableVm.vm_password}' rm -r /home/${availableVm.vm_username}/${FOLDER_PATH}/0g-storage-node` , label : "log_output_command" , platform_specific : false},
    ]
    
    await run_commands( state , build_commands).then((result)=>{
        console.log("Node Deleted successfully")
        successedStatus = true;
    })
    .catch((err) => {
        console.error("Error :", err);
        return err;
    });
 


    return successedStatus;
}
 





export default deleteZeroGStorageNode;






