const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const algorithm = 'aes-256-cbc'; // Encryption algorithm
const keyLength = 32; // AES-256 requires a 256-bit key (32 bytes)
const ivLength = 16; // AES requires a 16-byte IV

function encryptFile(filePath, password) {
  const key = crypto.createHash('sha256').update(password).digest();
  const iv = crypto.randomBytes(ivLength);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(`${filePath}.enc`);

  input.pipe(cipher).pipe(output);

  output.on('finish', () => {
    console.log('Encryption complete!');
    console.log(`IV: ${iv.toString('hex')}`);
  });

  // Save IV securely for decryption
  fs.writeFileSync(`${filePath}.iv`, iv);
}

// Example Usage
encryptFile(path.join(__dirname, 'example.txt'), 'your-secure-password');
