// AuthForm
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AuthForm: React.FC<{ mode: 'login' | 'register'; onAuth?: (user: any) => void }> = ({ mode, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [flip, setFlip] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Prevent user from going back to login if already logged in (token exists)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (mode === 'login' && token) {
      navigate('/dashboard', { replace: true });
    }
      setFlip(mode === "register");
  }, [mode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Forgot password - local reset
    if (showForgotPassword) {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and new password.');
        return;
      }

      try {
    // Send update request to backend
    const response = await fetch('http://localhost:3001/api/update-password', {
      method: 'PUT', // or POST depending on your API
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        newPassword: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update password.');
    }

    setSuccess('Password updated successfully! You can now log in.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setPassword('');
      setEmail('');
    }, 1500);

  } catch (err: any) {
    setError(err.message || 'Server error while updating password.');
  }

  return;
}

    const isEmailValid = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.com$/.test(email);
    const isPasswordValid = password.length >= 6;
    const isContactValid = /^09\d{9}$/.test(contactNumber.trim());

    if (mode === 'register') {
      if (!firstname.trim() || !lastname.trim()) {
        setError('Please enter both first and last names.');
        return;
      }
      if (!isContactValid) {
        setError('Contact number must start with 09 and be exactly 11 digits.');
        return;
      }
      if (!isEmailValid) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!isPasswordValid) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
    }

    try {
            const endpoint = mode === 'register' ? '/api/register' : '/api/login';
      const payload =
        mode === 'register'
          ? { firstname, lastname, contact_number: contactNumber, email, password }
          : { email, password };

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      if (mode === 'register') {
        const newUser = {
          firstname,
          lastname,
          contact_number: contactNumber,
          email,
          password,
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        setSuccess('Registered successfully!');
        setFirstname('');
        setLastname('');
        setContactNumber('');
        setEmail('');
        setPassword('');
        navigate('/');
      } else {
                setSuccess('Login successful!');
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (onAuth) onAuth(data.user);
        navigate('/dashboard');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.email === email && storedUser.password === password) {
          setSuccess('Login successful!');
          localStorage.setItem('token', 'dummy-token');
          if (onAuth) onAuth(storedUser);
          navigate('/dashboard');
        } else {
          setError('Invalid email or password.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Local storage error');
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-main" data-pc-preset="preset-1" data-pc-sidebar-caption="true" data-pc-direction="ltr" data-pc-theme="light">
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      <div className="auth-wrapper v1">
        <div className="auth-form">
          <div className="position-relative">
            <div className="auth-bg">
              <span className="r"></span>
              <span className="r s"></span>
              <span className="r s"></span>
              <span className="r"></span>
            </div>
            <div className={`flip-card-container ${flip ? 'flipping' : ''}`}>
            <div className="card mb-0">
              <div className="card-body">
                <h4 className="text-center f-w-500 mt-4 mb-3">
                  {showForgotPassword
                  ? 'Reset Password'
                  : mode === 'login' ? 'Login' : 'Register'}
                </h4>

              <form onSubmit={handleSubmit} noValidate autoComplete="off">
                {/* Register fields */}
                {!showForgotPassword && mode === 'register' && (
                  <>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        className="form-control"
                        placeholder="Contact Number"
                        value={contactNumber}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          if (onlyNums.length <= 11) setContactNumber(onlyNums);
                        }}
                        maxLength={11}
                        pattern="09\d{9}"
                        required
                      />
                      <small className="form-text text-muted">
                        Must start with 09 and be exactly 11 digits.
                      </small>
                    </div>
                  </>
                )}

                {/* Email field */}
                <div className="form-group mb-3">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password field */}
                {(!showForgotPassword || showForgotPassword) && (
                  <div className="form-group mb-3">
                    <label htmlFor="password">
                      {showForgotPassword ? 'New Password' : 'Password'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      placeholder={showForgotPassword ? 'Enter new password' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {mode === 'login' && !showForgotPassword && (
                  <div className="d-flex mt-1 justify-content-between align-items-center">
                    <h6 className="f-w-400 mb-0">
                      <span
                        className="link-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setError('');
                          setSuccess('');
                          setShowForgotPassword(true);
                        }}
                      >
                        Forgot Password?
                      </span>
                    </h6>
                  </div>
                )}

                {showForgotPassword && (
                  <div className="mt-2">
                    <small
                      className="text-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowForgotPassword(false)}
                    >
                      ← Back to Login
                    </small>
                  </div>
                )}

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary shadow px-sm-4">
                    {showForgotPassword
                      ? 'Update Password'
                      : mode === 'login'
                      ? 'Login'
                      : 'Register'}
                  </button>
                </div>
              </form>

              {!showForgotPassword && (
                <>
                  {mode === 'login' ? (
                    <div className="d-flex justify-content-between align-items-end mt-4">
                      <h6 className="f-w-500 mb-0">Don't have an account?</h6>
                      <Link to="/register" className="link-primary" 
                      onClick={(e) => {
                      e.preventDefault(); // stop instant navigation
                      setFlip(true); // trigger animation
                      setTimeout(() => navigate("/register"), 600); // navigate after animation finishes
                      }}>
                        Register here
                      </Link>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-end mt-4">
                      <h6 className="f-w-500 mb-0">Already have an account?</h6>
                      <Link to="/" className="link-primary"
                      onClick={(e) => {
                      e.preventDefault(); // stop instant navigation
                      setFlip(true); // trigger animation
                      setTimeout(() => navigate("/"), 600); // navigate after animation finishes
                    }}>
                        Login here
                      </Link>
                    </div>
                  )}
                </>
              )}

              {error && <p className="error text-danger text-center mt-3">{error}</p>}
              {success && <p className="success text-success text-center mt-3">{success}</p>}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default AuthForm;
