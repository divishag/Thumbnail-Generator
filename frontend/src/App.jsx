import { useState } from "react";
import { createJob, getJob, uploadHeadshot } from "./api";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [numThumbnails, setNumThumbnails] = useState(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [thumbnails, setThumbnails] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function handleGenerate() {
    if (!file) {
      setErrorMessage("Please upload a headshot first.");
      return;
    }

    if (!prompt.trim()) {
      setErrorMessage("Please enter a prompt.");
      return;
    }

    setErrorMessage("");
    setThumbnails([]);
    setIsGenerating(true);

    try {
      // 1) Upload headshot
      setStatusMessage("Uploading headshot...");
      const uploadResult = await uploadHeadshot(file);

      // 2) Create generation job
      setStatusMessage("Creating job...");
      const jobResult = await createJob({
        prompt: prompt.trim(),
        numThumbnails,
        headShotUrl: uploadResult.url,
      });

      // 3) Poll job status until completed or failed
      setStatusMessage("Generating thumbnails...");
      while (true) {
        const job = await getJob(jobResult.job_id);
        setThumbnails(job.thumbnails || []);

        if (job.status === "completed") {
          setStatusMessage("Generation completed.");
          break;
        }

        if (job.status === "failed") {
          throw new Error("Thumbnail generation failed.");
        }

        await wait(1800);
      }
    } catch (error) {
      setStatusMessage("");
      setErrorMessage(error.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="app">
      <h1>AI Thumbnail Generator</h1>

      <div className="form-group">
        <label htmlFor="headshot">Upload headshot</label>
        <input
          id="headshot"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] || null;
            setFile(selectedFile);
          }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          rows="4"
          placeholder="Describe your thumbnail..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="count">Number of thumbnails</label>
        <select
          id="count"
          value={numThumbnails}
          onChange={(event) => setNumThumbnails(Number(event.target.value))}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>

      <button type="button" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate Thumbnails"}
      </button>

      {statusMessage && <p className="status">{statusMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      <section className="results">
        {thumbnails.map((thumb) => (
          // 4) Display results as simple cards
          <article key={thumb.id} className="card">
            <h3>{thumb.style_name.replaceAll("_", " ")}</h3>
            <p>Status: {thumb.status}</p>
            {thumb.imagekit_url ? (
              <img src={thumb.imagekit_url} alt={thumb.style_name} />
            ) : (
              <div className="image-placeholder">Image not ready yet</div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
