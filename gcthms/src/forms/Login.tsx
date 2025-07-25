import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';




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
            <div className="auth-bg">
              <span className="r"></span>
              <span className="r s"></span>
              <span className="r s"></span>
              <span className="r"></span>
            </div>
            <div className="card mb-0">
              <div className="card-body">
                {/* <div className="text-center">
                  <img src="/assets/images/logo-dark.svg" alt="logo" />
                </div> */}
                <h4 className="text-center f-w-500 mt-4 mb-3">Login</h4>
                <div className="mb-3">
                  <input type="email" className="form-control" placeholder="Email Address" />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Password" />
                </div>
                <div className="d-flex mt-1 justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input input-primary" type="checkbox" id="rememberMe" defaultChecked />
                    <label className="form-check-label text-muted" htmlFor="rememberMe">Remember me?</label>
                  </div>
                  <h6 className="text-secondary f-w-400 mb-0">Forgot Password?</h6>
                </div>
                <div className="text-center mt-4">
                  <button type="button" className="btn btn-primary shadow px-sm-4" onClick={handleLogin} >Login</button>
                </div>
                <div className="d-flex justify-content-between align-items-end mt-4">
                  <h6 className="f-w-500 mb-0">Don't have an Account?</h6>
                  <Link to="/register" className="link-primary">Register here</Link>
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
