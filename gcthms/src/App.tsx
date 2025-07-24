import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './forms/Login';
import Register from "./forms/Register";
import Dashboard from './dist/dashboard/Dashboard';
import UploadPage from './components/UploadPage';
import './dist/assets/css/style.css';
import './dist/assets/js/plugins/popper.min.js';
import './dist/assets/js/plugins/simplebar.min.js';






export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}
