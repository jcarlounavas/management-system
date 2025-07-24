import React from 'react';
import DashboardLayout from './DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout >
      <h1>Welcome to the Dashboard</h1>
          <div
      data-pc-preset="preset-1"
      data-pc-sidebar-caption="true"
      data-pc-direction="ltr"
      data-pc-theme="light"
    >
      {/* Loader */}
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="pc-container">
        <div className="pc-content">
          <div className="page-header">
            <div className="page-block">
              <div className="row align-items-center">
                <div className="col-md-12">
                  <div className="page-header-title">
                    <h5 className="m-b-10">Dashboard</h5>
                  </div>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <a href="#"><i className="ph-duotone ph-house"></i></a>
                    </li>
                    <li className="breadcrumb-item"><a href="#">Dashboard</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Example Cards */}
          <div className="row">
            <div className="col-md-6 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-4">Card Title</h6>
                  <p className="mb-0">Content goes here</p>
                </div>
              </div>
            </div>
            {/* Add more cards or widgets as needed */}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>

  );
};

export default Dashboard;
