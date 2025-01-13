import React from 'react'
import { Route, Routes } from 'react-router-dom'
import FileEncryptDecrypt from './pages/FileEncryptDecrypt.jsx'

const App = () => {
  return (
    <div>
      <div>
        <h1>Encrypt your file before sharing. Secure your data.</h1>
      </div>
      <Routes>
        <Route path='/' element={<FileEncryptDecrypt />} />
          {/* <Route path='/home' element={<Encrypt />} /> */}
        </Routes>
    </div>
  )
}

export default App