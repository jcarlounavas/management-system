import React from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  return (
    <div
      className="auth-main"
      data-pc-preset="preset-1"
      data-pc-sidebar-caption="true"
      data-pc-direction="ltr"
      data-pc-theme="light"
    >
      {/* Pre-loader */}
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      {/* Auth wrapper */}
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
                <div className="text-center">
                  <a href="#">
                    <img src="/assets/images/logo-dark.svg" alt="logo" />
                  </a>
                </div>
                <h4 className="text-center f-w-500 mt-4 mb-3">Sign up</h4>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="mb-3">
                      <input type="text" className="form-control" placeholder="First Name" />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-3">
                      <input type="text" className="form-control" placeholder="Last Name" />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <input type="email" className="form-control" placeholder="Email Address" />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Contact Number"
                    maxLength={11}
                    pattern="\d{11}"
                    title="Please enter exactly 11 digits"
                    required
                  />
                </div>

                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Password" />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="Confirm Password" />
                </div>

                <div className="d-flex mt-1 justify-content-between">
                  <div className="form-check">
                    <input
                      className="form-check-input input-primary"
                      type="checkbox"
                      id="customCheckc1"
                      defaultChecked
                    />
                    <label className="form-check-label text-muted" htmlFor="customCheckc1">
                      I agree to all the Terms & Condition
                    </label>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button type="button" className="btn btn-primary shadow px-sm-4">
                    Sign up
                  </button>
                </div>

                <div className="d-flex justify-content-between align-items-end mt-4">
                  <h6 className="f-w-500 mb-0">Already have an Account?</h6>
                  <Link to="/" className="link-primary">Log In</Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Register;
