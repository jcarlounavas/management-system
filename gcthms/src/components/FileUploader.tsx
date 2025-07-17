import React from "react";

  interface Props {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: Props) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };
  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button type="button">Upload</button>
    </div>
  )
}