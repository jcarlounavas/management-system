// UploadPage.tsx
import React, { useState } from 'react';
import FileUploader from './FileUploader';
import FileReader from './FileReader';
import Sidebar from '../dist/dashboard/Sidebar';
import DashboardLayout from '../dist/dashboard/DashboardLayout';
import { Link, useLocation } from 'react-router-dom';


const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <>

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
                <div className="d-flex justify-content-center mt-3">
                <FileUploader onFileSelect={setSelectedFile}  />
                </div>
                <FileReader file={selectedFile} />
                
                </div>
            </div>
</div>
        
    </DashboardLayout>
      
    </>
  );
};

export default UploadPage;
