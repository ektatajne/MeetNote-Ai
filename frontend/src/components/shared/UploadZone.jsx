import { useState } from "react";

export default function UploadZone({ onUpload, isProcessing, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStart = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col space-y-4">
      <div
        className={`relative rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center transition-all bg-meet-card border-meet-line
          ${dragActive ? "bg-meet-input/40 border-[rgba(109,95,213,0.35)]" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleChange}
          accept="audio/wav, audio/mp3, audio/m4a, video/mp4"
        />

        {!selectedFile ? (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-meet-input border border-[rgba(109,95,213,0.3)] text-3xl text-meet-purpleLight mb-4">
              🎧
            </span>
            <h3 className="text-xl font-bold text-meet-text mb-1">
              {dragActive ? "Drop it here!" : "Drop your meeting recording here"}
            </h3>
            <p className="text-meet-muted mb-4">or click to browse files</p>
            <p className="text-xs text-meet-muted mb-6 font-medium uppercase tracking-widest">Supports WAV · MP3 · MP4 · M4A</p>

            <label
              htmlFor="file-upload"
              className="px-6 py-2 rounded-lg border border-meet-line bg-transparent font-semibold cursor-pointer transition text-meet-purpleLight hover:text-meet-text hover:border-[rgba(109,95,213,0.35)] focus-within:ring-2 focus-within:ring-[rgba(109,95,213,0.45)]"
            >
              Browse Files
            </label>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-meet-input rounded-full flex items-center justify-center mb-4 border border-[rgba(109,95,213,0.3)]">
              <span className="text-meet-purpleLight text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-bold text-meet-text mb-2 truncate max-w-full px-4">{selectedFile.name}</h3>
            <p className="text-sm text-meet-muted mb-6">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="px-6 py-2 rounded-lg border border-meet-line text-meet-muted font-semibold hover:bg-meet-input hover:text-meet-text transition"
            >
              Remove file ✕
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={!selectedFile || isProcessing || disabled}
        className={`w-full py-4 rounded-lg font-bold text-meet-text text-lg transition shadow-meet-sm
          ${!selectedFile || disabled ? "bg-meet-input text-meet-muted cursor-not-allowed shadow-none border border-meet-line" : "bg-meet-purple hover:bg-meet-purpleHover border border-[rgba(109,95,213,0.3)]"}
        `}
      >
        {isProcessing ? "Processing Transcription..." : "Start Transcription →"}
      </button>
    </div>
  );
}
