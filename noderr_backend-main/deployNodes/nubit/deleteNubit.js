import { Client } from "ssh2";
import fs from "fs";

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

const deployNubit = (availableVm) => {
    const connSettings = {
		host: availableVm.vm_ip,
		port: 22, // Default SSH port
		username: availableVm.vm_username,
		password: availableVm.vm_password,
	};

    // We will recive there rpcUrl and service name from clients

    const commands = [
        `sudo -S <<< '${connSettings.password}' apt update && sudo -S <<< '${connSettings.password}' apt upgrade -y`,
        `sudo -S <<< '${connSettings.password}' rm -rf nubit-node`,
    ];
    establishSSHConnection(connSettings, commands)
        .then(() => {
            console.log("Node depoyed!");
        })
        .catch((err) => {
            console.error("Error occurred during SSH connection:", err);
        });
}

export default deployNubit;