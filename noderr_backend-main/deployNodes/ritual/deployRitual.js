import { Client } from "ssh2";
import { TryCatch } from "../../utils/TryCatch.js";
import fs from "fs";
import Keys from "../../models/keysModel.js";
import ErrorHandler from "../../utils/ErrorHandler.js";
import { ethers } from "ethers";
import contractABI from "./abi/ritualContractABI.json" assert { type: "json" };
import updateMakeFile from "./updateMakeFile.js";
// import { register } from "module";
import updateDeploySolidity from "./updateDeploySolidity.js";
const contractAddress = "0x8D871Ef2826ac9001fB2e33fDD6379b6aaBF449c";

// const requestForDeployment = TryCatch(async (req, res, next) => {
//   const key = generateKeys();

//   const newKey = new Keys({
//     publicKey: key.publicKey,
//     privateKey: key.privateKey,
//   });
//   await newKey.save();

//   return res.status(200).json({
//     success: true,
//     data: {
//       publickey: key.publicKey,
//     },
//   });
// });

const deployRitual = (availableVm, request) => {
	const hostIp = availableVm.vm_ip;
	const username = availableVm.vm_username;
	const password = availableVm.vm_password;


	const private_key = request.private_key;
	const rpcURL = request.rpc_url;
	// const userPrivateKey = private_key;
	const provider = new ethers.JsonRpcProvider("https://mainnet.base.org/");
	const contract = new ethers.Contract(contractAddress, contractABI, provider);
	const signer = new ethers.Wallet(private_key, provider);
	const connectSigner = contract.connect(signer);

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

	async function copyFileToRemote(connSettings, remoteFilePath, localFilePath) {
		return new Promise((resolve, reject) => {
			const conn = new Client();

			conn.on("ready", () => {
				conn.sftp((err, sftp) => {
					if (err) {
						conn.end();
						return reject(err);
					}

					const writeStream = sftp.createWriteStream(remoteFilePath);
					writeStream.on("error", (err) => {
						console.error("Error transferring file:", err);
						conn.end();
						reject(err);
					});

					const readStream = fs.createReadStream(localFilePath);

					readStream.pipe(writeStream);

					writeStream.on("close", () => {
						conn.end();
						resolve();
					});
				});
			});

			conn.on("error", (err) => {
				console.error("Error occurred:", err);
				conn.end();
				reject(err);
			});

			conn.connect(connSettings);
		});
	}

	const updateFile = (filePath, rpcUrl, privateKey) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				console.error("Error reading file:", err);
				return;
			}
			try {
				const jsonData = JSON.parse(data);
				jsonData.chain.rpc_url = rpcUrl;
				jsonData.chain.wallet.private_key = privateKey;
				const updatedJsonData = JSON.stringify(jsonData, null, 2);
				fs.writeFile(filePath, updatedJsonData, "utf8", (writeErr) => {
					if (writeErr) {
						console.error("Error writing file:", writeErr);
						return;
					}
					console.log("Data updated successfully.");
				});
			} catch (parseError) {
				console.error("Error parsing JSON:", parseError);
			}
		});
	};

	const activateNode = async () => {
		// signer send transaction
		try {
			const tx = await connectSigner.activateNode();
			await tx.wait();
			console.log("Node activated");
		} catch (error) {
			console.log("");
		}
	}

	const registerNode = async (address) => {
		try {
			const tx = await connectSigner.registerNode(address);
			await tx.wait();
			console.log("Node registered");
		} catch (error) {
			console.log("");
		}
	}
	// Example usage:
	const connSettings = {
		host: hostIp,
		port: 22, // Default SSH port
		username: username,
		password: password,
	};
	const commands1 = [
		`sudo -S <<< "${password}" apt update && sudo apt upgrade -y`,
		`sudo -S <<< "${password}" apt -qy install curl git jq lz4 build-essential screen`,
		`sudo -S <<< "${password}" apt install docker.io -y`,
		`sudo -S <<< "${password}" docker --version`,
		`sudo -S <<< "${password}" apt-get install ca-certificates curl gnupg lsb-release`,
		`sudo -S <<< "${password}" mkdir -m 0755 -p /etc/apt/keyrings`,
		`sudo -S <<< "${password}" curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`,
		`sudo -S <<< "${password}" echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
		`sudo -S <<< "${password}" apt-get update`,
		`sudo -S <<< "${password}" apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`,
		`sudo -S <<< "${password}" systemctl start docker`,
		`sudo -S <<< "${password}" git clone https://github.com/ritual-net/infernet-container-starter`,
		`sudo -S <<< "${password}" chown -R ${username}:${username} infernet-container-starter`,
		`screen -d -m bash -c "cd infernet-container-starter && sudo -S <<< '${connSettings.password}' project=hello-world make deploy-container"`,
		`cd infernet-container-starter/deploy && sudo -S <<< "${password}" chown ${username}:${username} config.json`,
		// `cd infernet-container-starter/deploy && sudo -S <<< "${password}" rm config.json`,
	];
	const commands2 = [
		`sudo -S <<< "${password}" docker restart infernet-anvil`,
		`sudo -S <<< "${password}" docker restart hello-world`,
		`sudo -S <<< "${password}" docker restart infernet-node`,
		`sudo -S <<< "${password}" docker restart deploy-fluentbit-1`,
		`sudo -S <<< "${password}" docker restart deploy-redis-1`,
		`mkdir foundry`,
		`cd foundry && sudo -S <<< "${password}" curl -L https://foundry.paradigm.xyz | bash`,
		// `cd foundry && source /home/${username}/.bashrc && sudo -S <<< "${password}" foundryup`,
		`source /home/${username}/.bashrc`,
		`./foundryup`,
		`cd infernet-container-starter && sudo -S <<< "${password}" rm -rf projects/hello-world/contracts/lib/forge-std`,
		`cd infernet-container-starter && sudo -S <<< "${password}" rm -rf projects/hello-world/contracts/lib/infernet-sdk`,
		`sudo -S <<< "${password}" ln -s /home/${username}/.foundry/bin/forge /usr/local/bin/forge`, //[run this command",
		`cd ~/infernet-container-starter/projects/hello-world/contracts && sudo -S <<< "${password}" forge install --no-commit foundry-rs/forge-std`,
		`git config --global --add safe.directory /home/${username}/infernet-container-starter`,
		`sudo -S <<< "${password}" git config --global --add safe.directory /home/${username}/infernet-container-starter/projects/hello-world/contracts/lib/infernet-sdk`,
		`cd ~/infernet-container-starter/projects/hello-world/contracts && sudo -S <<< "${password}" forge install --no-commit ritual-net/infernet-sdk`,
		`cd infernet-container-starter &&  sudo -S <<< "${password}"  project=hello-world make deploy-contracts`,
		`cd infernet-container-starter &&  sudo -S <<< "${password}"  project=hello-world make call-contract`,
	];
	// onchain Remaining
	const rpcUrl = `https://base-rpc.publicnode.com/`;
	const privateKey = private_key;
	const filePath = "deployNodes/ritual/config.json";
	const makeFilePath = "deployNodes/ritual/Makefile";
	const deploySolidityPath = "deployNodes/ritual/Deploy.s.sol";

	const remoteFilePath = `/home/${username}/infernet-container-starter/deploy/config.json`;
	const remoteMakeFilePath = `/home/${username}/infernet-container-starter/projects/hello-world/contracts/Makefile`;
	const remoteDeploySolidityFilePath = `/home/${username}/infernet-container-starter/projects/hello-world/contracts/script/Deploy.s.sol`;

	establishSSHConnection(connSettings, commands1)
		.then(() => {
			console.log("All commands executed successfully");
			registerNode(signer.address);
			activateNode();
			updateFile(filePath, rpcUrl, privateKey);
			updateMakeFile(privateKey, rpcUrl, makeFilePath);
			updateDeploySolidity(contractAddress, deploySolidityPath);
			copyFileToRemote(connSettings, remoteDeploySolidityFilePath, deploySolidityPath)
				.then(() => {
					copyFileToRemote(connSettings, remoteFilePath, filePath)
						.then(() => {
							copyFileToRemote(connSettings, remoteMakeFilePath, makeFilePath)
								.then(() => {
									establishSSHConnection(connSettings, commands2).then(() => {
										console.log("Node deployed");
										console.log("Ritual Node Deployed!");
									});
								})
								.catch((err) => {
									console.log(err);
								});
						})
						.catch((err) => {
							console.log(err);
						});
				})
				.catch((err) => {
					console.log(err);
				})

		})
		.catch((err) => {
			console.error("Error occurred during SSH connection:", err);
		});
};
// export { deployRitual, requestForDeployment };

export default deployRitual;