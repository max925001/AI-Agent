import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Home from './pages/Home'
import CustomizeAI from './pages/CustomizeAI'
import ProtectedRoute from './components/ProtectedRoute'
import Customize2 from './pages/Customize2'

function App() {
const userData = JSON.parse(localStorage.getItem('data'));  
console.log(userData)

  return (
  <Routes>
<Route path='/signup' element={<Signup/>}/>
<Route path='/login' element={<Login/>}/>
<Route path='/' element={<ProtectedRoute>{(userData?.aiassistanceName && userData?.assistanceImage)? <Home/> : <Navigate to="/customizeai" />}</ProtectedRoute>}/>
<Route path='/customizeai' element={<ProtectedRoute><CustomizeAI/></ProtectedRoute>}/>
<Route path='/customize2' element={<ProtectedRoute><Customize2/></ProtectedRoute>}/>


  </Routes>
  )
}

export default App
