import React, { useRef, useState } from "react";

const FileUploadComponent: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const container = useRef<HTMLDivElement | null>(null);
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });

  worker.onmessage = (event) => {
    if (event.data.type === "progress") {
      setUploadPercentage(event.data.percentage);
    }
    if (event.data.type === "complete") {
      setTimeElapsed(event.data.timeElapsed);
      alert(
        `Files uploaded successfully. Time elapsed: ${event.data.timeElapsed} seconds`
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
  };

  const handleUpload = () => {
    if (!files) {
      alert("No files selected.");
      return;
    }
    const fileArray = Array.from(files);
    worker.postMessage({ type: "upload", files: fileArray });
  };

  const changeBackground = () => {
    if (container.current) {
      container.current.style.backgroundColor = `#f3${Math.floor(
        Math.random() * 21
      )}`;
    }
  };

  return (
    <div ref={container}>
      <input
        type="file"
        onChange={handleFileChange}
        {...({ webkitdirectory: "true", directory: "true" } as any)}
      />
      <button onClick={handleUpload}>Upload</button>
      <div>
        <progress value={uploadPercentage} max="100" />
      </div>
      <div>Time Elapsed: {timeElapsed} seconds</div>
      <button onClick={changeBackground}>Change Background</button>
    </div>
  );
};

export default FileUploadComponent;
