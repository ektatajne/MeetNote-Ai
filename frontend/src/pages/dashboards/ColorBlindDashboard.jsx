import { useState, useEffect } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import UploadZone from "../../components/shared/UploadZone";
import ResultTabs from "../../components/shared/ResultTabs";
import TranscriptPanel from "../../components/shared/TranscriptPanel";
import SummaryPanel from "../../components/shared/SummaryPanel";
import MindMap from "../../components/shared/MindMap";
import useTranscription from "../../hooks/useTranscription";

export default function ColorBlindDashboard() {
  const { setActiveProfile } = useAccessibility();
  const [activeTab, setActiveTab] = useState("transcript");

  useEffect(() => {
    setActiveProfile("colorblind");
  }, [setActiveProfile]);

  const apiKey = localStorage.getItem("openai_api_key") || "";
  const { result, loading, error, transcribeFile } = useTranscription(apiKey);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (result && result.text) {
      setHasProcessed(true);
    }
  }, [result]);

  const handleUpload = async (file) => {
    await transcribeFile(file);
  };

  const convertedTranscript = result?.text
    ? result.text.split(/(?<=[.?!])\s+/).map((sentence, idx) => ({
        time: `00:0${idx}:00`,
        speaker: result.text.startsWith("Error:") ? "System" : idx % 2 === 0 ? "Speaker A" : "Speaker B",
        text: sentence,
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto p-8 pb-32 bg-meet-bg min-h-full">
      <div className="bg-meet-card border border-meet-line border-l-4 border-l-meet-purple p-4 rounded-lg mt-2 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-meet-sm">
        <div>
          <h2 className="text-meet-text font-bold text-lg flex items-center">
            <span className="mr-2">👁️</span> Color Blindness Mode Active
          </h2>
          <p className="text-meet-muted text-sm mt-1">
            Interface optimized — no color-only signals. Using distinct shapes and high-contrast palettes.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-meet-input border border-red-500/40 text-red-300 rounded-lg">{error}</div>
      )}

      <UploadZone onUpload={handleUpload} isProcessing={loading} disabled={hasProcessed} />

      {(hasProcessed || loading) && (
        <div className="mt-8">
          <ResultTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {loading && <div className="text-center py-20 text-meet-muted animate-pulse">Processing Audio...</div>}
          {!loading && activeTab === "transcript" && <TranscriptPanel transcript={convertedTranscript} />}
          {!loading && activeTab === "summary" && <SummaryPanel summary={result?.summary} />}
          {!loading && activeTab === "mindmap" && <MindMap data={result?.mindmap} />}
        </div>
      )}
    </div>
  );
}
