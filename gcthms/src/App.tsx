import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './forms/Login';
import Register from "./forms/Register";
import Dashboard from './dist/dashboard/Dashboard';
import UploadPage from './components/UploadPage';
import DisplayInditranc from './components/TransactionTable'
import Contacts from './components/Contacts';

import './dist/assets/css/style.css';
import './dist/assets/js/plugins/popper.min.js';
import './dist/assets/js/plugins/simplebar.min.js';
import SummaryTransaction from './components/SummaryTransaction';






export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/individual" element={<DisplayInditranc />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/summary" element={<SummaryTransaction />} />
      </Routes>
    </Router>
  );
}
