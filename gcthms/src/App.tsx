
import React, { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import FileReader from './components/FileReader';
import AuthForm from './components/AuthForm';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState('');

  const handleAuth = (mode: string, userObj: any) => {
    setUser(userObj);
  };

  return (
    <div>
      {!user ? (
        <AuthForm onAuth={handleAuth} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <h2>Welcome, {user.fullname || user.username}!</h2>
          <p>You are logged in.</p>
        </div>
      )}
    </div>
  );
}

