import { ethers } from "ethers";
import { Client } from "ssh2";
import contractABI from "./abi/ritualContractABI.json" assert { type: "json" };
const contractAddress = "0x8D871Ef2826ac9001fB2e33fDD6379b6aaBF449c";

const deleteRitual = (vm) => {
    const hostIp = vm.vm_ip;
    const username = vm.vm_username;
    const password = vm.vm_password;

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
            conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }
                stream
                    .on("close", (code, signal) => {
                        console.log(`Command '${command}' exited with code ${code}`);
                        resolve(); // Resolve the promise after command execution
                    })
                    .on("data", (data) => {
                        console.log(data.toString("utf8"));
                    })
                    .stderr.on("data", (data) => {
                        console.error(data.toString("utf8"));
                    });
            });
        });
    }

    // Example usage:
    const connSettings = {
        host: hostIp,
        port: 22, // Default SSH port
        username: username,
        password: password,
    };
    const commands1 = [
        `cd infernet-container-starter/deploy && sudo -S <<< "${password}" sudo docker compose down`,
        `sudo -S <<< '${password}' rm -rf infernet-container-starter`,
    ];
    
    establishSSHConnection(connSettings, commands1)
        .then(() => {
            console.log("All commands executed successfully");
            console.log("Node was deleted successfully");
        })
        .catch((err) => {
            console.error("Error occurred during SSH connection:", err);
        });
};

export default deleteRitual;