import { Wallet } from "ethers";
import { ethers } from "ethers";

// export const generatePrivateKey = () => {
//   return ethers.Wallet.createRandom().privateKey;
// };

export const RPC = "https://mainnet.base.org/";
export function generateKeys() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = Wallet.createRandom(provider);

  const privKey = wallet.privateKey;
  // console.log(wallet);
  // console.log(wallet.publicKey);
  // console.log(privKey);
  return {
    publicKey: wallet.publicKey,
    privateKey: privKey,
  };
}