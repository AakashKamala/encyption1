const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Create directories if they don't exist
const dirs = ['uploads', 'encrypted', 'decrypted'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// AES settings
const algorithm = 'aes-256-cbc';
const keyLength = 32;
const ivLength = 16;

// Encrypt a file
app.post('/encrypt', upload.single('file'), (req, res) => {
  const password = req.body.password;
  const file = req.file;

  if (!password || !file) {
    return res.status(400).json({ message: 'Password and file are required!' });
  }

  try {
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const inputPath = file.path;
    const outputPath = path.join('encrypted', `${file.originalname}.enc`);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input.pipe(cipher).pipe(output);

    output.on('finish', () => {
      fs.unlinkSync(inputPath); // Delete the uploaded file
      res.json({ 
        message: 'File encrypted successfully!', 
        iv: iv.toString('hex'), 
        encryptedFile: `/download/${path.basename(outputPath)}`
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Encryption failed!', error: error.message });
  }
});

// Decrypt a file
// app.post('/decrypt', upload.single('file'), (req, res) => {
//   try {
//     const password = req.body.password;
//     const file = req.file;
//     const ivHex = req.body.iv;

//     if (!password || !file) {
//       return res.status(400).json({ message: 'Password and file are required!' });
//     }

//     const key = crypto.createHash('sha256').update(password).digest();
//     const iv = Buffer.from(ivHex, 'hex');
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);

//     const inputPath = file.path;
//     const outputPath = path.join('decrypted', file.originalname.replace('.enc', ''));

//     const input = fs.createReadStream(inputPath);
//     const output = fs.createWriteStream(outputPath);

//     input.pipe(decipher).pipe(output);

//     output.on('finish', () => {
//       fs.unlinkSync(inputPath); // Delete the uploaded file
//       res.json({ 
//         message: 'File decrypted successfully!', 
//         decryptedFile: `/download/decrypted/${path.basename(outputPath)}`
//       });
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Decryption failed!', error: error.message });
//   }
// });



app.post('/decrypt', upload.single('file'), (req, res) => {
  try {
    const password = req.body.password;
    const file = req.file;
    const ivHex = req.body.iv;

    if (!password || !file) {
      return res.status(400).json({ message: 'Password and file are required!' });
    }

    const key = crypto.createHash('sha256').update(password).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    const inputPath = file.path;
    const outputPath = path.join('decrypted', file.originalname.replace('.enc', ''));

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input.pipe(decipher).pipe(output);

    output.on('finish', () => {
      fs.unlinkSync(inputPath); // Delete the uploaded file

      // You can add additional checks here to verify if the file is valid after decryption
      res.json({
        message: 'File decrypted successfully!',
        decryptedFile: `/download/decrypted/${path.basename(outputPath)}`
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Decryption failed!', error: error.message });
  }
});


// Serve encrypted and decrypted files
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'encrypted', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found!' });
  }
});

app.get('/download/decrypted/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'decrypted', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});