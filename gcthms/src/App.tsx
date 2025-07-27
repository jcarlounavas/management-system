
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './forms/AuthForm';
import Dashboard from './dist/dashboard/Dashboard';
import UploadPage from './components/UploadPage';
import DisplayInditranc from './components/TransactionTable'
import Contacts from './components/Contacts';
import DisplaySummary from './components/Summary';

import './dist/assets/css/style.css';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/individual" element={<DisplayInditranc />} />
      </Routes>
    </Router>
  );
};

export default App;