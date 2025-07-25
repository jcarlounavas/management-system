import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { Dashboard, Contacts, UploadFile, ListAlt } from '@mui/icons-material';
interface SidebarProps {
  isSidebarHidden: boolean;
}

const Sidebar: React.FC <SidebarProps> = ({ isSidebarHidden }) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;


  return (
    <nav className={`pc-sidebar pc-trigger ${isSidebarHidden ? "collapsed" : ""}`}>
      <div className="navbar-wrapper " style={{ display: "block" }}>
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
                        <div
                        className="user-profile text-white py-4 px-3 d-flex flex-column align-items-center  mb-4"
                        style={{ cursor: 'pointer' }}
                        onClick={() => alert('Profile clicked!')}
                      >
                        <img
                          src="../UserAvatar.png"
                           className="rounded-circle mb-3 shadow"
                            width="100"
                            height="100"
                          alt="User Avatar"
                        />
                        <div>
                          <div ><h6 className="mb-1  text-white fw-bold fs-6">USER</h6></div>

                          <small style={{ fontSize: 12, color: '#ccc' }}>View Profile</small>
                        </div>
                      </div>
<ul className="pc-navbar" style={{display: "block"}}>
            <li className="pc-item pc-caption">
              <label data-i18n="Navigation">Navigation</label>
            </li>

            <li className={`pc-item ${isActive("/dashboard") ? "active" : ""}`}>
              <Link to="/dashboard" className="pc-link">
                <span className="pc-micon"><Dashboard /></span>
                <span className="pc-mtext" data-i18n="Dashboard">Dashboard</span>
              </Link>
            </li>

            {/* Future sections (color, typography, icons, etc.) can be uncommented and added as needed */}

            <li className={`pc-item ${isActive("/contacts") ? "active" : ""}`}>
              <Link to="/contacts" className="pc-link" >
                    <span className="pc-micon"><Contacts /></span>
                    <span className="pc-mtext">Contacts</span>
                </Link>
            </li>
            <li className={`pc-item ${isActive("/summary") ? "active" : ""}`}>
              <Link to="/summary" className="pc-link" >
                    <span className="pc-micon"><ListAlt /></span>
                    <span className="pc-mtext">Summary Transactions</span>
                </Link>
            </li>
            <li className={`pc-item ${isActive("/individual") ? "active" : ""}`}>
              <Link to="/individual" className="pc-link" >
                    <span className="pc-micon"><ListAlt /></span>
                    <span className="pc-mtext">All Transactions</span>
                </Link>
            </li>
            <li className={`pc-item ${isActive("/upload") ? "active" : ""}`}>
                <Link to="/upload" className="pc-link" >
                    <span className="pc-micon"><UploadFile /></span>
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
                    </div>


            
          </div>


        </div>
      </nav>
 
  );
};

export default Sidebar;
