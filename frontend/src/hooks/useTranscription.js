import { useState } from "react";
import { transcribeAudio, transcribeFromUrl } from "../services/whisperService";

export default function useTranscription() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const transcribeFile = async (file, options = {}) => {
  setLoading(true);
  setError("");

  try {
    const data = await transcribeAudio(file, options);

    setResult({
      mode: data.mode,
      text: data.text,
      summary: data.summary,
      mindmap: data.mindmap,
      segments: data.segments || [],
      speaker_turns: data.speaker_turns || [],
      words: data.words || [],
      semantic: data.semantic || null,
      target_lang: data.target_lang || "",
      language: data.language || "",
    });

  } catch (err) {
    console.error(err);
    setError("Error: " + err.message);
    setResult({ text: "Error: Could not transcribe this audio file. Please check backend logs or try a different file." });
  } finally {
    setLoading(false);
  }
};

  const transcribeUrl = async (url) => {
    setLoading(true);
    setError("");

    try {
      const data = await transcribeFromUrl(url);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("URL endpoint unavailable.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const transcribeRecording = async (blob) => {
    const recordedFile = new File([blob], "recording.webm", {
      type: blob.type || "audio/webm",
    });
    await transcribeFile(recordedFile);
  };

  return { result, loading, error, transcribeFile, transcribeUrl, transcribeRecording };
}
