import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/885ebbf42614453ca50dc29f683bd2ad');

const sendSepoliaToUser = async (recipientPrivateKey) => {
  const senderPrivateKey = process.env.PRIVATE_KEY;
  const recipientAddress = new ethers.Wallet(recipientPrivateKey).address;
  const signer = new ethers.Wallet(senderPrivateKey, provider);
  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: ethers.parseUnits('0.001', 'ether'),
  });
  console.log(tx);
}

export default sendSepoliaToUser;