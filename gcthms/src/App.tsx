import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import FileUploader from './components/FileUploader';

type User = {
  id: number;
  firstname: string;
  email: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleFileUpload = (file: File) => {
    console.log('Uploading file for user:', user);
    console.log('Selected file:', file);
    // You can now handle the file upload to your server, Google API, etc.
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {user ? (
          <>
            <h2 style={styles.welcome}>Welcome, {user.firstname}!</h2>
            <FileUploader onFileSelect={handleFileUpload} />
          </>
        ) : (
          <AuthForm onLogin={(user) => setUser(user)} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f4f6f8',
  },
  card: {
    background: '#ffffff',
    padding: '40px 30px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    minWidth: '300px',
    width: '100%',
    maxWidth: '500px',
  },
  welcome: {
    textAlign: 'center',
    color: '#333',
  },
} as const;

export default App;
