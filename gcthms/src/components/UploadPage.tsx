// UploadPage.tsx
import React, { useState } from 'react';
import FileUploader from './FileUploader';
import FileReader from './FileReader';
import Sidebar from '../dist/dashboard/Sidebar';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { Link, useLocation } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>(""); // New state for account number

  return (
    <>
      <DashboardLayout>
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
              {/* New Account Number Input (Added on top of the upload) */}
              <div className="d-flex justify-content-center mt-3">
                <div className="account-input-container mb-2" style={{ width: '100%', maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Original File Uploader (Unchanged) */}
              <div className="d-flex justify-content-center mt-3">
                <FileUploader onFileSelect={setSelectedFile} />
              </div>
              <FileReader file={selectedFile} accNum={accountNumber} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default UploadPage;