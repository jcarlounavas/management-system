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
            <div className="container mt-5">
                <div className="page-header">
                    <div className="page-block">
                    <div className="row align-items-center">
                        <div className="col-md-12">
                        <div className="page-header-title">
                            <h5 className="m-b-10 badge bg-brand-color-2 text-white f-24 mt-4 ms-2 px-3 py-2">Uploading Files</h5>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                <FileUploader onFileSelect={setSelectedFile}  />
                <FileReader file={selectedFile} />
                
           </div>     
</div>
        
    </DashboardLayout>
      
    </>
  );
};

export default UploadPage;
