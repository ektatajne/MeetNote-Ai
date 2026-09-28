import { useState } from "react";

const MODES = {
  url: "url",
  file: "file",
  record: "record",
};

export default function UploadPanel({ onUploadFile, onUploadUrl, onUploadRecording, loading }) {
  const [mode, setMode] = useState(MODES.file);
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [localError, setLocalError] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const handleUpload = async () => {
    setLocalError("");

    try {
      if (mode === MODES.file) {
        if (!file) {
          setLocalError("Please choose an audio file first.");
          return;
        }
        await onUploadFile(file);
        return;
      }

      if (mode === MODES.url) {
        if (!url.trim()) {
          setLocalError("Please enter a valid audio URL.");
          return;
        }
        await onUploadUrl(url.trim());
        return;
      }

      if (mode === MODES.record) {
        if (!recordedBlob) {
          setLocalError("Record audio first, then transcribe.");
          return;
        }
        await onUploadRecording(recordedBlob);
        return;
      }
    } catch (err) {
      console.error(err);
      setLocalError("Something went wrong while uploading.");
    }
  };

  const startRecording = async () => {
    try {
      setLocalError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setLocalError("Microphone permission denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
    setMediaRecorder(null);
  };

  const tabBtn = (m, label, icon) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`flex items-center justify-center gap-2 px-3 py-3 text-sm border-r border-meet-line last:border-0 flex-1 transition ${
        mode === m ? "bg-meet-purple text-meet-text font-semibold" : "bg-transparent text-meet-muted hover:bg-meet-input/50"
      }`}
    >
      <span aria-hidden="true">{icon}</span> {label}
    </button>
  );

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-meet-line bg-meet-card p-5 shadow-meet-sm">
      <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-meet-line bg-meet-input">
        {tabBtn(MODES.url, "From URL", "🔗")}
        {tabBtn(MODES.file, "From file", "📁")}
        {tabBtn(MODES.record, "Record", "🎙️")}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-meet-text">Upload</h3>
      </div>

      {mode === MODES.file && (
        <label
          htmlFor="audio-file"
          className="mb-4 flex cursor-pointer items-center justify-between rounded-xl border border-meet-line bg-meet-input px-4 py-3 transition hover:border-[rgba(109,95,213,0.35)]"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-base text-meet-muted" aria-hidden="true">
              ♫
            </span>
            <p className="truncate text-sm font-medium text-meet-text">{file ? file.name : "Choose audio file"}</p>
          </div>
          <span className="text-lg text-meet-muted" aria-hidden="true">
            ›
          </span>
        </label>
      )}

      {mode === MODES.url && (
        <div className="mb-4 rounded-xl border border-meet-line bg-meet-input px-3 py-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            className="w-full border-none bg-transparent text-sm text-meet-text placeholder:text-meet-muted outline-none focus:ring-0"
          />
        </div>
      )}

      {mode === MODES.record && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="rounded-lg border border-meet-line bg-transparent px-4 py-2 text-sm font-medium text-meet-muted hover:text-meet-text transition"
              >
                Start recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="rounded-lg border border-red-500/40 bg-meet-input px-4 py-2 text-sm font-medium text-red-300"
              >
                Stop recording
              </button>
            )}
          </div>
          {recordedUrl && (
            <audio controls src={recordedUrl} className="w-full">
              Your browser does not support audio playback.
            </audio>
          )}
        </div>
      )}

      <input id="audio-file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading}
        className="w-full rounded-xl bg-meet-purple hover:bg-meet-purpleHover px-4 py-3 text-base font-medium text-meet-text transition border border-[rgba(109,95,213,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : "Transcribe"}
      </button>

      {localError && <p className="mt-3 text-sm text-red-300">{localError}</p>}
    </section>
  );
}
