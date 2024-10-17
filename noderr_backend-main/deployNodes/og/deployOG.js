import { Client } from "ssh2";
import { promisify } from 'util';
import toml from "@iarna/toml";
 


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
			if (state.platform && Object.keys(command.cmd).includes( state.platform?.toLowerCase() ) ){
				let platform_commands = command.cmd[ state.platform.toLowerCase() ]
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
			else{
				console.log("Platform Not Found")
				break;
			}
		}
	}
}
async function executeCommand(conn, command , label  , state = null) {
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
				}
				else if (label == "architecture"){
					architecture = command_output.split('\n').map(line => line.trim())[0];	
					architecture && state ? state.architecture = architecture : ""
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
async function update_configFile( state ){	
    const server_connection = state.server_connections;
    const configTomlData = toml.stringify( state.settings );;
    // console.log("DATA: ", configTomlData);
    const conn = new Client();
    try {
      await connect(conn , server_connection);
      console.log('Client :: ready');
      const sftp = await getSftp(conn);
      const writeFile = promisify(sftp.writeFile.bind(sftp));
      
      await writeFile(state.config_file_path, configTomlData);
      console.log('Settings data added to config.toml file on server successfully');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      conn.end();
    }
}



async function update_systemctl_file(state) {
    const server_connection = state.server_connections;
    const systemCtlData = state.systemctl_file_content;
    // console.log("DATA: ", systemCtlData);
  
    const conn = new Client();
    
    try {
      await connect(conn , server_connection);
      console.log('Client :: ready');
      const sftp = await getSftp(conn);
      const writeFile = promisify(sftp.writeFile.bind(sftp));
      
      await writeFile(state.systemctl_file_path, systemCtlData);
      console.log('SystemCTL file updated on server successfully');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      conn.end();
    }
}




  


async function installGo( state ) {
    const installUrl = 'https://golang.org/dl/';
    const goLatestReleaseTag = '1.22.2';

    const os = state.platform;
    const arch = state.architecture;

    // Construct download URL based on OS and architecture
    const downloadUrl = `${installUrl}go${goLatestReleaseTag}.${os}-${arch}.tar.gz`;
    console.log(`Downloading Go from: ${downloadUrl}`);

    try {
        const { stdout, stderr } = await exec(`curl -OL ${downloadUrl}`);
        if (stderr) {
            throw new Error(`Error downloading Go: ${stderr}`);
        } else {
            console.log(stdout);
        }
    } catch (error) {
        console.error(error.message);
        throw error;
    }

    console.log("Verifying checksums ");
    try {
        const { stdout, stderr } = await exec(`sha256sum go${goLatestReleaseTag}.${os}-${arch}.tar.gz`);
        if (stderr) {
            throw new Error(`Error verifying checksums: ${stderr}`);
        } else {
            console.log(stdout);
        }
    } catch (error) {
        console.error(error.message);
        throw error;
    }

    console.log("Extracting Go tarball");
    const extractCmd = os === 'win32' ? `tar -xf go${goLatestReleaseTag}.${os}-${arch}.tar.gz -C /usr/local` : `tar -C /usr/local -xvf go${goLatestReleaseTag}.${os}-${arch}.tar.gz`;
    try {
        const { stdout, stderr } = await exec(extractCmd);
        if (stderr) {
            throw new Error(`Error extracting Go: ${stderr}`);
        } else {
            console.log(stdout);
        }
    } catch (error) {
        console.error(error.message);
        throw error;
    }
    setGoEnvVars(os);

    console.log('Go installation complete!');
    return true;
}
function setGoEnvVars(os) {
    const goInstallDir = '/usr/local/go';

    function setEnvVar(name, value) {
        if (os === 'win32') {
            process.env[name] = value.replace(/\//g, '\\');
        } else {
            process.env[name] = value;
        }
    }
    setEnvVar('GOROOT', goInstallDir);
    console.log('Go environment variables set.');
}  
function connect( conn , server_connection ) {
    return new Promise((resolve, reject) => {
      conn.on('ready', resolve).on('error', reject).connect(server_connection);
    });
};
function getSftp( conn ){
    return new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) {
          reject(err);
        } else {
          resolve(sftp);
        }
      });
    });
};





const deployZeroGStorageNode = async (availableVm) => {
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
        config_file_path : `${FOLDER_PATH}/0g-storage-node/run/config.toml`,

        settings : {
            network_libp2p_port : 1234,
            network_discovery_port : 1234,
            network_libp2p_nodes : [],
            network_private : false,
            network_disable_discovery : false,
            
            rpc_listen_address : "0.0.0.0:5678",
            network_boot_nodes : ["/ip4/54.219.26.22/udp/1234/p2p/16Uiu2HAmTVDGNhkHD98zDnJxQWu3i1FL1aFYeh9wiQTNu4pDCgps","/ip4/52.52.127.117/udp/1234/p2p/16Uiu2HAkzRjxK2gorngB1Xq84qDrT4hSVznYDHj6BkbaE4SGx9oS"],
            log_contract_address : "0x2b8bC93071A6f8740867A7544Ad6653AdEB7D919",
            mine_contract_address : "0x228aCfB30B839b269557214216eA4162db24445d",
            blockchain_rpc_endpoint : "https://rpc-testnet.0g.ai",
            log_sync_start_block_number : 80981,
            network_target_peers : 50,
            db_dir : "db",
            network_dir : "network"
        },

        systemctl_file_content : `[Unit]
Description=ZGS_Auto Node Service
After=network.target

[Service]
ExecStart=/home/${availableVm.vm_username}/${FOLDER_PATH}/0g-storage-node/target/release/zgs_node --config /home/${availableVm.vm_username}/${FOLDER_PATH}/0g-storage-node/run/config.toml
WorkingDirectory=/home/${availableVm.vm_username}/${FOLDER_PATH}/0g-storage-node/run/
Restart=always
User=${availableVm.vm_username}
Group=${availableVm.vm_username}
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
            `,

        systemctl_file_path : `/etc/systemd/system/${NODE_NAME}_node.service`,

        function_map : {
            "installGo" : installGo,
            "update_configFile" : update_configFile,
            "update_systemctl_file" : update_systemctl_file
        }

    }


    const git_branch = "v0.2.0"


    const build_commands = [
        { cmd: 'uname -s', label: 'platform' , platform_specific : false },
        { cmd: 'uname -m', label: 'architecture' , platform_specific : false },
        // update system & install build essentials
        {
            cmd : { 
                "linux" : [ 
                    {cmd : `sudo -S <<< '${availableVm.vm_password}' apt-get update -y` , label : "dependency_command" } ,
                    {cmd : `sudo -S <<< '${availableVm.vm_password}' apt-get install clang cmake build-essential -y` , label :  "dependency_command" }
                ] ,
                "darwin" : [ 
                    {cmd:  "brew install llvm cmake" , label :  "dependency_command" } 
                ] 
            } , 
            platform_specific : true
        },
        // Install Rust
        { cmd : "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y" , label : "log_output_command" , platform_specific : false},
    
        // Install Go
        {
            cmd : { 
                "linux" : [ 
                    {cmd : "wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz" , label : "dependency_command" } ,
                    {cmd : `sudo -S <<< '${availableVm.vm_password}' rm -rf /usr/local/go && sudo -S <<< '${availableVm.vm_password}' tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz` , label :  "dependency_command" },
                    {cmd : "export PATH=$PATH:/usr/local/go/bin" , label :  "dependency_command" }
    
                ] ,
                "darwin" : [ 
                    // commadns for darwin goes here
                    { cmd : "installGo" , label : "function_call" },
                ] 
            } , 
            platform_specific : true
        }, 
        
        { cmd : `if [ ! -d '${FOLDER_PATH}' ]; then mkdir ${FOLDER_PATH}; fi` , label : "log_output_command" , platform_specific : false},
        { cmd : `cd ${FOLDER_PATH}/ && git clone -b ${git_branch} https://github.com/0glabs/0g-storage-node.git` , label : "log_output_command" , platform_specific : false},
        { cmd : `cd ${FOLDER_PATH}/0g-storage-node/ && git submodule update --init` , label : "log_output_command" , platform_specific : false},
        { cmd : `cd ${FOLDER_PATH}/0g-storage-node/ && /home/${state.server_connections.username}/.cargo/bin/cargo build --release` , label : "log_output_command" , platform_specific : false},
        { cmd : `rm ${FOLDER_PATH}/0g-storage-node/run/config.toml` , label : "log_output_command" , platform_specific : false},
        { cmd : `update_configFile` , label : "function_call" , platform_specific : false},



        // condiguring systemctl
        { cmd : `sudo -S <<< '${availableVm.vm_password}' touch ${state.systemctl_file_path}` , label : "log_output_command" , platform_specific : false},
        { cmd : `sudo -S <<< '${availableVm.vm_password}' chmod 666 ${state.systemctl_file_path}` , label : "log_output_command" , platform_specific : false},
        { cmd : `chmod +x /home/${state.server_connections.username}/${FOLDER_PATH}/0g-storage-node/target/release/zgs_node` , label : "log_output_command" , platform_specific : false},
        { cmd : `update_systemctl_file` , label : "function_call" , platform_specific : false},
        { cmd : `sudo -S <<< '${availableVm.vm_password}' systemctl daemon-reload` , label : "log_output_command" , platform_specific : false},
        
        // run node
        { cmd : `sudo -S <<< '${availableVm.vm_password}' systemctl restart ${NODE_NAME}_node.service` , label : "log_output_command" , platform_specific : false},
        // check status
        { cmd : `sudo -S <<< '${availableVm.vm_password}' systemctl status ${NODE_NAME}_node.service` , label : "log_output_command" , platform_specific : false},

    ]

    

    
    await run_commands( state , build_commands).then((result)=>{
        console.log("Node Deployed successfully")
        successedStatus = true
    })
    .catch((err) => {
        console.error("Error :", err);
        return err;
    });

    return successedStatus;
}
 
 




export default deployZeroGStorageNode;

