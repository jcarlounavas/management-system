import { useState } from "react";
import './App.css';
import FileUploader from './components/FileUploader';
import FileReader from './components/FileReader';
export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  return (
    <div className="App">
      <main>
        <FileUploader onFileSelect={setSelectedFile}  />
       <FileReader file={selectedFile} />
      </main>
    </div>
  );
}

