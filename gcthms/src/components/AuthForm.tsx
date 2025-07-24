import React, { useState } from 'react';

const AuthForm: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url =
      mode === 'login'
        ? 'http://localhost:3001/api/login'
        : 'http://localhost:3001/api/register';

    const payload =
      mode === 'login'
        ? { email, password }
        : { firstname, lastname, contact_number: contactNumber, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setError('');
        if (mode === 'login') {
          onLogin(data); // user object
        } else {
          alert(data.message || 'Registered successfully!');
          setMode('login');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <input
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
            <input
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
            <input
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login'
          ? 'Need an account? Register'
          : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default AuthForm;
