function decryptFile(filePath, password) {
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = fs.readFileSync(`${filePath}.iv`); // Read IV
  
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(filePath.replace('.enc', ''));
  
    input.pipe(decipher).pipe(output);
  
    output.on('finish', () => {
      console.log('Decryption complete!');
    });
  }
  
  // Example Usage
  decryptFile(path.join(__dirname, 'example.txt.enc'), 'your-secure-password');
  