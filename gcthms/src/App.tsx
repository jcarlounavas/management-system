
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './forms/AuthForm';
import Dashboard from './dist/dashboard/Dashboard';
import UploadPage from './components/UploadPage';
import DisplayInditranc from './components/TransactionTable'
import Contacts from './components/Contacts';
import DisplaySummary from './components/Summary';
import ViewPage from './components/ViewPage';
import FormContact from './components/FormContact';
import ContactTransactions from './components/ContactTransaction';
import ProtectedRoute from './protect/ProtectedRoute';


  
import './dist/assets/css/style.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />

        {/* Protected Routes */}

        {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/individual" element={<ProtectedRoute><DisplayInditranc /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute><DisplaySummary /></ProtectedRoute>} />
        <Route path="/FormContacts/:id" element={<ProtectedRoute><FormContact /></ProtectedRoute>} />
       <Route path="/contacts/new" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
       <Route path="/contacts/:id/transactions" element={<ProtectedRoute><ContactTransactions /></ProtectedRoute>} /> */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/individual"
          element={
            <ProtectedRoute>
              <DisplayInditranc />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <DisplaySummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />

        <Route path="/summary/:id" element={
          <ProtectedRoute>
            <ViewPage />
          </ProtectedRoute>
        } />
        
        <Route path="/contacts/new" 
        element={
          <ProtectedRoute>
            <FormContact />
          </ProtectedRoute>
        }
        />

        <Route path="/contacts/:id/transactions" 
        element={
          <ProtectedRoute>
            <ContactTransactions />
          </ProtectedRoute>
        }
        />


      </Routes>
    </Router>
  );
};

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/upload" element={<UploadPage />} />
//         <Route path="/individual" element={<DisplayInditranc />} />
//         <Route path="/contacts" element={<Contacts />} />
//         <Route path="/summary" element={<DisplaySummary />} />
//         <Route path="/summary/:id" element={<ViewPage />} />
//         <Route path="/contacts/new" element={<FormContact />} />
//         <Route path="/contacts/:id/transactions" element={<ContactTransactions />} />"

//       </Routes>
//     </Router>
//   );
// }

export default App;