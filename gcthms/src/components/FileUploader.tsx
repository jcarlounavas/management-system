import { useState } from "react";

export default function FileUploader() {


  
  return (
    <div>
      <input type="file" accept=".pdf" />
      <button type="button">Upload</button>
    </div>
  )
}