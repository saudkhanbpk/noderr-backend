// main.mjs
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

const UpdateEnvFile = (filepath, rpc_url, private_key, password) => {
	const filePath = filepath;

	// Read the file contents
	fs.readFile(filePath, "utf8", (err, data) => {
		if (err) {
			console.error("Error reading file:", err);
			return;
		}
		try {
			const lines = data.trim().split('\n');
			const keyValuePairs = lines.reduce((acc, line) => {
				const [key, value] = line.split('=');
				acc[key] = value;
				return acc;
			}, {});

			// Assign new values
			keyValuePairs.ETH_CLIENT_ADDRESS = rpc_url;
			keyValuePairs.ETH_TESTNET_KEY = private_key;
			keyValuePairs.RLN_RELAY_CRED_PASSWORD = password;

			// Write the updated contents back to the file
			const updatedContents = Object.entries(keyValuePairs)
				.map(([key, value]) => `${key}=${value}`)
				.join('\n');
			fs.writeFile(filePath, updatedContents, "utf8", (writeErr) => {
				if (writeErr) {
					console.error("Error writing file:", writeErr);
					return;
				}
				console.log("Data Updated successfully.");
			});
		} catch (error) {
			console.error(error)
		}
	});
}

const deployWakuNode = async (availableVm, request) => {
	console.log("🚀 ~ deployWakuNode ~ request:", request)
	let successedStatus = false;
	// console.log(availableVm, request);
	const connSettings = {
		host: availableVm.vm_ip,
		port: 22, // Default SSH port
		username: availableVm.vm_username,
		password: availableVm.vm_password,
	};
	const commands1 = [
		`sudo -S <<< '${connSettings.password}' apt-get install build-essential git libpq5 jq`,
		"git clone https://github.com/waku-org/nwaku-compose",
	];
	const commands2 = [
		`cd nwaku-compose && sudo -S <<< "${connSettings.password}" mv envForNode .env`,
		`cd nwaku-compose && sudo -S <<< "${connSettings.password}" openssl ecparam -genkey -name secp256k1 -out private_key.pem`,
		`cd nwaku-compose && sudo -S <<< "${connSettings.password}" echo -e "\nNODEKEY=$(sudo -S <<< "${connSettings.password}" openssl ec -in private_key.pem -outform DER | tail -c +8 | head -c 32| xxd -p -c 32)" >> .env`,
		`cd nwaku-compose && sudo -S <<< "${connSettings.password}" ./register_rln.sh`,
		`cd nwaku-compose && sudo -S <<< "${connSettings.password}" docker compose up -d`,
		// `cd nwaku-compose && sudo -S <<< "${connSettings.password}" docker compose logs -f nwaku`
	];

	const rpcUrl = request.rpc_url;
	const privateKey = request.private_key;
	const password = request.password;
	const filePath = "deployNodes/waku/envForNode";
	const remoteFilePath = `/home/${connSettings.username}/nwaku-compose/envForNode`;

	await establishSSHConnection(connSettings, commands1)
		.then(() => {
			console.log("All commands executed successfully");
			UpdateEnvFile(filePath, rpcUrl, privateKey, password)
			const watcher = fs.watch(filePath, (event, filename) => {
				console.log(event, filename);
				if (event === "change") {
					console.log(`File ${filename} has been modified`);
					watcher.close();
					copyFileToRemote(connSettings, remoteFilePath, filePath)
						.then(() => {
							console.log("File transferred successfully");
							establishSSHConnection(connSettings, commands2).then(() => {
								console.log("Node deployed");
								successedStatus = true
							});
						})
						.catch((err) => {
							console.error("Error occurred during file transfer:", err);
							return err;
						});
				}
			});
		})
		.catch((err) => {
			console.error("Error occurred during SSH connection:", err);
			return err;
			// Handle error
		});
	return successedStatus;
}



export default deployWakuNode;
