// UploadPage.tsx
import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import FileReader from './FileReader';
import DashboardLayout from '../dist/dashboard/DashboardLayout';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [showAccountError, setShowAccountError] = useState<boolean>(false);
  const [accountNumbers, setAccountNumbers] = useState<{ account_number: string }[]>([]);

  // Fetch all existing account numbers for the dropdown
  useEffect(() => {
    const fetchAccountNumbers = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) return;

      try {
        const res = await fetch(`http://localhost:3001/api/account-numbers?user_id=${user_id}`);
        if (!res.ok) throw new Error('Failed to fetch account numbers');

        const data = await res.json();
        setAccountNumbers(data);
      } catch (error) {
        console.error('Error fetching account numbers:', error);
      }
    };

    fetchAccountNumbers();
  }, []);

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
            {/* Account Number Input with Dropdown */}
            <div className="d-flex justify-content-center mt-3">
              <div className="account-input-container mb-2" style={{ width: '100%', maxWidth: '400px' }}>
                <select
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="form-control mb-2"
                >
                  <option value="" className='text-center'> Select Account number </option>
                  {accountNumbers.map((acct, id) => (
                    <option key={acct.account_number} value={acct.account_number}>
                     {id + 1} - {acct.account_number}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or type new account number"
                  className="form-control"
                  value={accountNumber}
                  onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, '');
                  setAccountNumber(onlyNums)}}
                  maxLength={11}
                  pattern="09\d{9}"

                />
              </div>

            </div>

            {/* File Uploader */}
            <div className="d-flex justify-content-center mt-3">
              <FileUploader onFileSelect={handleFileSelect} />
            </div>

            {/* File Reader */}
            <FileReader file={selectedFile} accNum={accountNumber} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
