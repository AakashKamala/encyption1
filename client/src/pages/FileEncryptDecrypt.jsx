import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import "./encrypt.css"

const FileEncryptDecrypt = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [encryptedFileUrl, setEncryptedFileUrl] = useState('');
  const [decryptedFileUrl, setDecryptedFileUrl] = useState('');
  const [error, setError] = useState('');
  const [fileIv, setFileIv] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Handle file drop
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      console.log("No valid file dropped");
      return;
    }
    console.log('Dropped file:', acceptedFiles[0]);
    setFile(acceptedFiles[0]);
    // Check if file is encrypted
    setIsDecrypting(acceptedFiles[0].name.endsWith('.enc'));
    // Reset URLs and IV when new file is dropped
    setEncryptedFileUrl('');
    setDecryptedFileUrl('');
    if (!acceptedFiles[0].name.endsWith('.enc')) {
      setFileIv(''); // Only reset IV if uploading a new file for encryption
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/octet-stream': ['.enc'] // Added support for encrypted files
    },
    onDropAccepted: (acceptedFiles) => {
      console.log('Accepted files:', acceptedFiles);
    },
    onDropRejected: (rejectedFiles) => {
      console.log('Rejected files:', rejectedFiles);
      setError('Invalid file type. Please check the supported file formats.');
    },
  });

  const encryptFile = async () => {
    if (!file || !password) {
      setError('Please upload a file and enter a password');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:3000/encrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.encryptedFile) {
        setEncryptedFileUrl(`http://localhost:3000${response.data.encryptedFile}`);
        setFileIv(response.data.iv);
        setError('');
      }
    } catch (err) {
      setError('Error encrypting file. Please try again.');
      console.error('Encryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  const decryptFile = async () => {
    if (!file || !password) {
      setError('Please upload a file and enter a password');
      return;
    }

    if (!fileIv) {
      setError('Please enter the IV that was provided during encryption');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('iv', fileIv);

    try {
      const response = await axios.post('http://localhost:3000/decrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.decryptedFile) {
        setDecryptedFileUrl(`http://localhost:3000${response.data.decryptedFile}`);
        setError('');
      }
    } catch (err) {
      setError('Error decrypting file. Please check your password and IV and try again.');
      console.error('Decryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-encrypt-decrypt">
      <h2>File Encryption and Decryption</h2>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & Drop your file here, or click to select a file</p>
        <small>Supported formats: PDF, TXT, JPG, PNG, DOC, DOCX, XLS, XLSX, ENC</small>
      </div>

      {file && <p>Selected file: {file.name}</p>}

      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>

      {isDecrypting && (
        <div>
          <label>IV (Required for decryption):</label>
          <input
            type="text"
            value={fileIv}
            onChange={(e) => setFileIv(e.target.value)}
            placeholder="Enter the IV provided during encryption"
          />
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button onClick={encryptFile} disabled={loading || isDecrypting}>
          {loading ? 'Processing...' : 'Encrypt'}
        </button>
        <button onClick={decryptFile} disabled={loading || !isDecrypting}>
          {loading ? 'Processing...' : 'Decrypt'}
        </button>
      </div>

      {encryptedFileUrl && (
        <div className="download">
          <p>File encrypted successfully!</p>
          <a href={encryptedFileUrl} download className="download-link">
            Download Encrypted File
          </a>
          <p className="iv-info">
            <strong>Important:</strong> Save this IV for later decryption: 
            <code>{fileIv}</code>
          </p>
        </div>
      )}

      {decryptedFileUrl && (
        <div className="download">
          <p>File decrypted successfully!</p>
          <a href={decryptedFileUrl} download className="download-link">
            Download Decrypted File
          </a>
        </div>
      )}
    </div>
  );
};

export default FileEncryptDecrypt;