import React from 'react';
import DashboardLayout from './DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout >
          <div
      data-pc-preset="preset-1"
      data-pc-sidebar-caption="false"
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
                </div>
              </div>
            </div>
          </div>

          {/* Example Cards */}
          <div className="row">
            <div className="col-md-6 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h1 className="mb-4">Total Debit</h1>
                  <p className="mb-0">Content goes here</p>
                </div>
              </div>
              
            </div>
            <div className="col-md-6 col-xl-4">
              <div className="card">
                <div className="card-body">
                  <h1 className="mb-4">Total Credit</h1>
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
