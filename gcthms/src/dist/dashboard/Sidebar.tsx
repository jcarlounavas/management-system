import React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard, Contacts, UploadFile, ListAlt } from '@mui/icons-material';
import '../assets/css/Sidebar.css';

interface SidebarProps {
  isSidebarHidden: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarHidden }) => {
  const location = useLocation();
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sidebarHidden');
    localStorage.removeItem('sidebarInitialized');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className={`pc-sidebar pc-trigger  ${isSidebarHidden ? 'collapsed' : ''}`}>
      <div className="navbar-wrapper" style={{ display: 'block' }}>
        <div className="navbar-content pc-trigger active" data-simplebar="init">
          <div className="simplebar-wrapper" style={{ margin: '-10px, 10px' }}>
            <div className="simplebar-mask">
              <div className="simplebar-offset" style={{ right: '0px', bottom: '0px' }}>
                <div
                  className="simplebar-content-wrapper"
                  tabIndex={0}
                  role="region"
                  aria-label="scrollable content"
                  style={{ height: '100%', overflow: 'auto' }}
                >
                  <div
                    className="user-profile text-white py-4 px-3 d-flex flex-column align-items-center mb-4">
                                          <div
                        className="mx-auto d-flex align-items-center justify-content-center bg-light border rounded-circle overflow-hidden"
                        style={{ width: '100px', height: '100px' }}
                    >
                        {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        ) : (
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>No Photo</span>
                        )}
                    </div>
                    <div className="text-center">
                      <strong>{user?.name || user?.email || 'Guest'}</strong>
                    </div>
                    <div>
                      <Link to={'/profile'} className="text-white-50 small">
                        View Profile
                      </Link>
                    </div>
                  </div>

                  <ul className="pc-navbar" style={{ display: 'block' }}>
                    <li className="pc-item pc-caption">
                      <label data-i18n="Navigation">Navigation</label>
                    </li>

                    <li className={`pc-item ${isActive('/dashboard') ? 'active' : ''}`}>
                      <Link to="/dashboard" className="pc-link">
                        <span className="pc-micon">
                          <Dashboard />
                        </span>
                        <span className="pc-mtext" data-i18n="Dashboard">
                          Dashboard
                        </span>
                      </Link>
                    </li>

                    <li className={`pc-item ${isActive('/contacts') ? 'active' : ''}`}>
                      <Link to="/contacts" className="pc-link">
                        <span className="pc-micon">
                          <Contacts />
                        </span>
                        <span className="pc-mtext">Contacts</span>
                      </Link>
                    </li>

                    <li className={`pc-item ${isActive('/summary') ? 'active' : ''}`}>
                      <Link to="/summary" className="pc-link">
                        <span className="pc-micon">
                          <ListAlt />
                        </span>
                        <span className="pc-mtext">Summary Transactions</span>
                      </Link>
                    </li>

                    <li className={`pc-item ${isActive('/individual') ? 'active' : ''}`}>
                      <Link to="/individual" className="pc-link">
                        <span className="pc-micon">
                          <ListAlt />
                        </span>
                        <span className="pc-mtext">All Transactions</span>
                      </Link>
                    </li>

                    <li className={`pc-item ${isActive('/upload') ? 'active' : ''}`}>
                      <Link to="/upload" className="pc-link">
                        <span className="pc-micon">
                          <UploadFile />
                        </span>
                        <span className="pc-mtext">Upload Files</span>
                      </Link>
                    </li>

                    <li className="mt-5 d-flex justify-content-center">
                      <button
                        type="button"
                        className="btn btn-danger d-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded shadow-sm transition"
                        style={{ zIndex: 10, position: 'relative' }}
                        onClick={handleLogout}
                      >
                        <i className="ph ph-sign-out"></i>
                        Log out
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
