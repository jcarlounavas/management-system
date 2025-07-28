// UploadPage.tsx
import React, { useState } from 'react';
import FileUploader from './FileUploader';
import FileReader from './FileReader';
import Sidebar from '../dist/dashboard/Sidebar';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { Link, useLocation } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [showAccountError, setShowAccountError] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    if (!accountNumber.trim()) {
      setShowAccountError(true);
      alert("Please enter an account number first");
      return window.location.reload();
    }
    setShowAccountError(false);
    setSelectedFile(file);
  };

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
              {/* Account Number Input */}
              <div className="d-flex justify-content-center mt-3">
                <div className="account-input-container mb-2" style={{ width: '100%', maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setShowAccountError(false);
                    }}
                    className={`form-control ${showAccountError ? 'is-invalid' : ''}`}
                  />
                  {showAccountError && (
                    <div className="invalid-feedback">
                      Please enter an account number first
                    </div>
                  )}
                </div>
              </div>

              {/* File Uploader */}
              <div className="d-flex justify-content-center mt-3">
                <FileUploader onFileSelect={handleFileSelect} />
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