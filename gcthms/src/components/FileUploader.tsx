import React, { useRef } from "react";

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
    <div className="upload-container">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        
      />
      <button type="button" onClick={handleButtonClick}>
        Upload PDF File
      </button>
    </div>
  );
}
