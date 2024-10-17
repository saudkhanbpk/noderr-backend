import fs from "fs";

const updateDeploySolidity = (newRegistryAddress, filePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
  
    // Replace the sender private key and RPC_URL
    const updatedContent = data
      .replace(/address registry = 0x[a-fA-F0-9]{40};/, `address registry = ${newRegistryAddress};`)
  
    // Write the updated content back to the file
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('File updated successfully!');
      }
    });
  });
}

export default updateDeploySolidity;