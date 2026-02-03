import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./pages/Home"
import SolveProblem from "./pages/SolveProblem"
import Login from "./pages/Login"
import Register from "./pages/Register"

//import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/home" element={<Home />} />
          <Route path="/solve/:problemId" element={<SolveProblem />} />
        {/* </Route> */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


