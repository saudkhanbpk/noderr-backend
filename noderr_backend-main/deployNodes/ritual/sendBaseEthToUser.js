import { ethers } from "ethers";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const provider = new ethers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/6JNVPe7cF-Tswtbo33YDYZCrl0ZbyViU');

const sendBaseEthToUser = async (recipientPrivateKey) => {
  const senderPrivateKey = process.env.PRIVATE_KEY;
  const recipientAddress = new ethers.Wallet(recipientPrivateKey).address;
  const signer = new ethers.Wallet(senderPrivateKey, provider);
  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: ethers.parseUnits('0.001', 'ether'),
  });
  console.log(tx);
}

export default sendBaseEthToUser;