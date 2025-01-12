import React from 'react'
import { Route, Routes } from 'react-router-dom'
import FileEncryptDecrypt from './pages/FileEncryptDecrypt.jsx'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<FileEncryptDecrypt />} />
      {/* <Route path='/home' element={<Encrypt />} /> */}
    </Routes>
  )
}

export default App