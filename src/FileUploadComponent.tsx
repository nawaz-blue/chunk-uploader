import React, { useState } from "react";
import axios from "axios";

interface PreSignedUrlResponse {
  url: string;
}

interface CombineChunksResponse {
  success: boolean;
  url: string;
}

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const splitBlobIntoChunks = (blob: Blob, chunkSize: number): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;
    while (start < blob.size) {
      const end = Math.min(start + chunkSize, blob.size);
      const chunk = blob.slice(start, end);
      chunks.push(chunk);
      start = end;
    }
    return chunks;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected.");
      return;
    }
    
    // Initiate multipart upload and get UploadId
    const uploadId = await initiateMultipartUpload();
    if (!uploadId) {
      alert("Failed to initiate multipart upload.");
      return;
    }

    const chunkSize = 1024 * 1024;
    const chunks = splitBlobIntoChunks(file, chunkSize);
    const totalChunks = chunks.length;

    const uploadPromises = chunks.map(async (chunk, index) => {
      try {
        // Get pre-signed URL from backend
        const { data } = await axios.get<PreSignedUrlResponse>(
          `http://localhost:3001/get-pre-signed-url?filename=${file.name}&chunkIndex=${index}`
        );

        let putURL: string = data.toString();

        // Upload the chunk to S3
        const uploadResult = await axios.put(putURL, chunk, {
          headers: {
            "Content-Type": "application/octet-stream", // Adjust this to your file type if necessary
          },
        });

        return uploadResult.status === 200;
      } catch (error) {
        console.error(`Error uploading chunk ${index}: `, error);
        return false;
      }
    });

    const results = await Promise.all(uploadPromises);

    // Notify backend to combine chunks
    if (results.every((res) => res)) {
      const { data } = await axios.post<CombineChunksResponse>(
        "http://localhost:3001/combine-chunks",
        {
          filename: file.name,
          totalChunks,
          uploadId
        }
      );

      if (data.success) {
        alert(`File uploaded and combined successfully. URL: ${data.url}`);
      } else {
        alert("File combining failed.");
      }
    } else {
      alert("File upload failed.");
    }
  };

  const initiateMultipartUpload = async () => {
    if (!file) {
      console.error("File is not selected.");
      return null;
    }
    
    try {
      const { data } = await axios.get(
        `http://localhost:3001/initiate-multipart-upload?filename=${file.name}`
      );
      return data.uploadId;
    } catch (error) {
      console.error("Error initiating multipart upload: ", error);
      return null;
    }
  };
  

  // function generateRandomID() {
  //   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //   let randomID = '';
  //   for (let i = 0; i < 5; i++) {
  //     const randomIndex = Math.floor(Math.random() * characters.length);
  //     randomID += characters.charAt(randomIndex);
  //   }
  //   return randomID;
  // }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUploadComponent;
