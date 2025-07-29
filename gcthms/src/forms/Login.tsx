import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Email, Lock } from '@mui/icons-material';
import './auth.css';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
  // Optionally add validation or authentication here
  navigate('/dashboard'); // 👈 This redirects to Dashboard page
};
  return (
    <div
      className="auth-main"
      data-pc-preset="preset-1"
      data-pc-sidebar-caption="true"
      data-pc-direction="ltr"
      data-pc-theme="light"
    >
      {/* Preloader */}
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      {/* Auth Wrapper */}
      <div className="auth-wrapper v1">
        <div className="auth-form">
          <div className="position-relative">
            
            
            <div className="card login-card animate__animated animate__fadeInDown shadow rounded-4">
      <div className="card-body p-4">
        <div className="text-center mb-3">
          <img src="/assets/images/logo-dark.svg" alt="logo" height={40} />
        </div>

        <h4 className="text-center fw-semibold mb-4">Welcome Back</h4>

        <div className="mb-3 input-group">
          <span className="input-group-text bg-white border-end-0">
            <Email fontSize="small" />
          </span>
          <input
            type="email"
            className="form-control border-start-0"
            placeholder="Email Address"
          />
        </div>

        <div className="mb-3 input-group">
          <span className="input-group-text bg-white border-end-0">
            <Lock fontSize="small" />
          </span>
          <input
            type="password"
            className="form-control border-start-0"
            placeholder="Password"
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              defaultChecked
            />
            <label className="form-check-label text-muted ms-1" htmlFor="rememberMe">
              Remember me
            </label>
          </div>
          <Link to="#" className="small text-primary text-decoration-none">
            Forgot Password?
          </Link>
        </div>

        <div className="d-grid">
          <button
            type="button"
            className="btn btn-primary shadow-sm"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>

        <div className="text-center mt-4">
          <span className="text-muted">Don't have an account?</span>{' '}
          <Link to="/register" className="fw-medium text-decoration-none">
            Register here
          </Link>
        </div>
      </div>
    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
