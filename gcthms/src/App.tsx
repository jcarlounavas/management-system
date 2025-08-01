
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './forms/Login';
import Register from './forms/Register';
import Dashboard from './dist/dashboard/Dashboard';
import UploadPage from './components/UploadPage';
import DisplayInditranc from './components/TransactionTable'
import Contacts from './components/Contacts';
import DisplaySummary from './components/Summary';
import ViewPage from './components/ViewPage';
import FormContact from './components/FormContact';
import ContactTransactions from './components/ContactTransaction';


import './dist/assets/css/style.css';







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
        <Route path="/summary" element={<DisplaySummary />} />
        <Route path="/summary/:id" element={<ViewPage />} />
        <Route path="/contacts/new" element={<FormContact />} />
        <Route path="/contacts/:id/transactions" element={<ContactTransactions />} />"

      </Routes>
    </Router>
  );
}
