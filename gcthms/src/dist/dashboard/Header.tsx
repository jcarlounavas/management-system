import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // adjust based on your app
    onLogout(); // 🔁 Call the function passed from DashboardLayout
  };

  return (
    <header className="pc-header">
      <div className="header-wrapper">
        <div className="me-auto pc-mob-drp">
          {/* ... search, sidebar buttons ... */}
        </div>

        <div className="ms-auto">
          <ul className="list-unstyled">
            <li className="dropdown pc-h-item header-user-profile">
              <a className="pc-head-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#">
                <i className="ph ph-user-circle"></i>
              </a>
              <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown p-0 overflow-hidden">
                <div className="dropdown-header d-flex align-items-center justify-content-between bg-primary">
                  <div className="d-flex my-2">
                    <div className="flex-shrink-0">
                      <img src="../assets/images/user/avatar-2.png" alt="user" className="user-avatar wid-35" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-white mb-1">Carson Darrin 🖖</h6>
                      <span className="text-white text-opacity-75">carson.darrin@company.io</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown-body">
                  {/* other links */}
                  <div className="d-grid my-2 px-3">
                    <button className="btn btn-danger" onClick={handleLogout}>
                      <i className="ph ph-sign-out me-2"></i> Logout
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;