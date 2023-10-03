import axios from "axios";

onmessage = async (ev: MessageEvent) => {
  if (ev.data.type === "upload") {
    const files = ev.data.files;
    let timeElapsed = 0;
    const startTime = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { data } = await axios.get(
          `http://localhost:3001/get-pre-signed-url?filename=${file.name}`
        );

        await axios.put(data.url, file, {
          headers: { "Content-Type": "application/octet-stream" },
        });

        postMessage({
          type: "progress",
          percentage: ((i + 1) * 100) / files.length,
        });
      } catch (error) {
        postMessage({ type: "error", message: "Upload failed" });
        return;
      }
    }

    const endTime = Date.now();
    timeElapsed = (endTime - startTime) / 1000;
    postMessage({ type: "complete", timeElapsed });
  }
};
