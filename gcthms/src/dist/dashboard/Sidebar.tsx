import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;


  return (
    <nav className="pc-sidebar pc-trigger">
      <div className="navbar-wrapper " style={{ display: "block" }}>
        <div className="m-header">
          <Link to="/dashboard" className="b-brand text-primary">
            <img src="/assets/images/logo-white.svg" className="img-fluid logo-lg" alt="logo" />
          </Link>
        </div>
        <div className="navbar-content pc-trigger active" data-simplebar="init">
          <div className="simplebar-wrapper" style={{margin: "-10px, 10px"}}>
                <div className="simplebar-height-auto-observer-wrapper">
                    <div className="simplebar-height-auto-observer"></div>
                </div>
                <div className="simplebar-mask">
                    <div className="simplebar-offset" style={{ right: "0px", bottom: "0px" }}>
                        <div
                        className="simplebar-content-wrapper"
                        tabIndex={0}
                        role="region"
                        aria-label="scrollable content"
                        style={{ height: "100%", overflow: "hidden" }}
                        >
                        <div className="simplebar-content" style={{ padding: "10px 0px" }}></div>
                        </div>
                    </div>
                    </div>


            <ul className="pc-navbar" style={{display: "block"}}>
            <li className="pc-item pc-caption">
              <label data-i18n="Navigation">Navigation</label>
            </li>

            <li className={`pc-item ${isActive("/dashboard") ? "active" : ""}`}>
              <Link to="/dashboard" className="pc-link">
                <span className="pc-micon"><i className="ph ph-house-line"></i></span>
                <span className="pc-mtext" data-i18n="Dashboard">Dashboard</span>
              </Link>
            </li>

            {/* Future sections (color, typography, icons, etc.) can be uncommented and added as needed */}

            <li className={`pc-item ${isActive("/contacts") ? "active" : ""}`}>
              <a href="#" target="_blank" className="pc-link">
                <span className="pc-micon"><i className="ph ph-sign-out"></i></span>
                <span className="pc-mtext">Contacts</span>
              </a>
            </li>
            <li className={`pc-item ${isActive("/summary") ? "active" : ""}`}>
              <a href="#" target="_blank" className="pc-link">
                <span className="pc-micon"><i className="ph ph-sign-out"></i></span>
                <span className="pc-mtext">Transaction Summary</span>
              </a>
            </li>
            <li className="pc-item">
              <a href="#" target="_blank" className="pc-link">
                <span className="pc-micon"><i className="ph ph-sign-out"></i></span>
                <span className="pc-mtext">Reports</span>
              </a>
            </li>
            <li className={`pc-item ${isActive("/upload") ? "active" : ""}`}>
                <Link to="/upload" className="pc-link" target="_blank">
                    <span className="pc-micon"><i className="ph ph-sign-out"></i></span>
                    <span className="pc-mtext">Upload Files</span>
                </Link>
                </li>

            <li className="mt-5 d-flex justify-content-center">
                <button
                type="button"
                className="btn btn-danger d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded shadow-sm transition"
                >
                <i className="ph ph-sign-out"></i>
                Log out
                </button>

                </li>


          </ul>
          </div>


        </div>
      </div>
    </nav>
    
  );
};

export default Sidebar;
