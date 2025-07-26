import React, { useRef } from "react";
import '../dist/assets/css/FileUpload.css';
interface Props {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <label className="upload-container">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        
      />
       <div className="folder">
        <div className="front-side">
          <div className="tip" />
          <div className="cover" />
        </div>
        <div className="back-side cover" />
      </div>
  <div className="custom-file-upload">
        Upload PDF File
      </div>

    </label>
  );
}
