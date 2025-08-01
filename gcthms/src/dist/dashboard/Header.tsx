import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pc-header">
      <div className="header-wrapper">
        <div className="me-auto pc-mob-drp">
          <ul className="list-unstyled">
            <li className="pc-h-item pc-sidebar-collapse">
              <a href="#" className="pc-head-link ms-0" id="sidebar-hide">
                <i className="ph ph-list"></i>
              </a>
            </li>
            <li className="pc-h-item pc-sidebar-popup">
              <a href="#" className="pc-head-link ms-0" id="mobile-collapse">
                <i className="ph ph-list"></i>
              </a>
            </li>
            <li className="dropdown pc-h-item">
              <a className="pc-head-link dropdown-toggle arrow-none m-0 trig-drp-search" data-bs-toggle="dropdown" href="#">
                <i className="ph ph-magnifying-glass"></i>
              </a>
              <div className="dropdown-menu pc-h-dropdown drp-search">
                <form className="px-3 py-2">
                  <input type="search" className="form-control border-0 shadow-none" placeholder="Search here. . ." />
                </form>
              </div>
            </li>
          </ul>
        </div>

        <div className="ms-auto">
          <ul className="list-unstyled">
            <li className="dropdown pc-h-item">

              {/* ...Notification dropdown contents... */}
            </li>

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
                  <a href="#" className="dropdown-item">
                    <i className="ph ph-gear me-2"></i> Settings
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="ph ph-share-network me-2"></i> Share
                  </a>
                  <a href="#" className="dropdown-item">
                    <i className="ph ph-lock-key me-2"></i> Change Password
                  </a>
                  <div className="d-grid my-2">
                    <button className="btn btn-primary">
                      <i className="ph ph-sign-out me-2"></i>Logout
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
