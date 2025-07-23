import React, { useState } from 'react';

interface AuthFormProps {
  onAuth: (type: 'login' | 'register', data: { fullname?: string; username: string; password: string }) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Optional loader

  const endpoint = isLogin
    ? '/login'
    : '/register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || (!isLogin && !fullname)) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = isLogin
        ? { username, password }
        : { fullname, username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      onAuth(isLogin ? 'login' : 'register', payload); // Pass up to parent
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button className="auth-toggle" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
        {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default AuthForm;
