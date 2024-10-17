import { Client } from "ssh2";

async function establishSSHConnection(connSettings, commands) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
            .on("ready", () => {
                console.log("SSH connection established");
                executeCommands(conn, commands)
                    .then(() => {
                        conn.end();
                        resolve(); // Resolve the promise after executing commands
                    })
                    .catch(reject);
            })
            .on("error", (err) => {
                console.error("Error occurred:", err);
                conn.end();
                reject(err); // Reject the promise in case of an error
            })
            .connect(connSettings);
    });
}

async function executeCommands(conn, commands) {
    for (const command of commands) {
        console.log(`Executing command: ${command}`);
        await executeCommand(conn, command);
    }
}

async function executeCommand(conn, command) {
    return new Promise((resolve, reject) => {
        let endpoint = '';
        conn.exec(command, (err, stream) => {
            if (err) {
                reject(err);
                return;
            }
            stream
                .on("close", (code, signal) => {
                    console.log(`Command '${command}' exited with code ${code}`);
                    resolve(endpoint); // Resolve the promise after command execution
                })
                .on("data", (data) => {
                    console.log(data.toString("utf8"));
                    if (data.includes('Listening on')) {
                        endpoint = data.toString().match(/:(\d+)/)[0];
                        console.log('Endpoint: ' + endpoint);
                    }
                })
                .stderr.on("data", (data) => {
                    console.error(data.toString("utf8"));
                });
        });
    });
}

const deleteFuelNode = (vm) => {
    const connSettings = {
		host: vm.vm_ip,
		port: 22, // Default SSH port
		username: vm.vm_username,
		password: vm.vm_password,
	};

    const commands = [
        `cd deploy-node-fuel && sudo -S <<< '${connSettings.password}' systemctl stop fuel-node`,
        `cd deploy-node-fuel && sudo -S <<< '${connSettings.password}' ansible-playbook fuel_node.yml -e node_action="remove"`,
        `sudo -S <<< '${connSettings.password}' rm -rf deploy-node-fuel`
    ];
    establishSSHConnection(connSettings, commands)
        .then(() => {
            console.log("Node was Deleted Successfully!");
        })
        .catch((err) => {
            console.error("Error occurred during SSH connection:", err);
        });
}

export default deleteFuelNode;