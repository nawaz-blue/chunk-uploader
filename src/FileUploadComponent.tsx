import React, { useState } from "react";
import axios from "axios";

interface PreSignedUrlResponse {
  url: string;
}

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected.");
      return;
    }

    try {
      const { data } = await axios.get<PreSignedUrlResponse>(
        `http://localhost:3001/get-pre-signed-url?filename=${file.name}`
      );

      const uploadResult = await axios.put(data.url, file, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (uploadResult.status === 200) {
        console.log(uploadResult.config.url)
        // alert("File uploaded successfully.");
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      alert("File upload failed.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUploadComponent;
