import crypto from 'crypto';
const encryptObject = (objectToEncrypt, encryptionKey) => {
  try {
    // Convert the object to a string
    const jsonString = JSON.stringify(objectToEncrypt);

    // Create a cipher using AES encryption algorithm
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);

    // Encrypt the JSON string using the cipher
    let encryptedString = cipher.update(jsonString, 'utf8', 'hex');
    encryptedString += cipher.final('hex');

    return encryptedString;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt object");
  }
};

const decryptObject = (encryptedString, encryptionKey) => {
  try {
    // Create a decipher using AES encryption algorithm
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);

    // Decrypt the encrypted string using the decipher
    let decryptedString = decipher.update(encryptedString, 'hex', 'utf8');
    decryptedString += decipher.final('utf8');

    // Parse the decrypted JSON string into an object
    const decryptedObject = JSON.parse(decryptedString);

    return decryptedObject;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt object");
  }
};

export { encryptObject, decryptObject };