import { useState, useEffect } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import UploadZone from "../../components/shared/UploadZone";
import ResultTabs from "../../components/shared/ResultTabs";
import TranscriptPanel from "../../components/shared/TranscriptPanel";
import SummaryPanel from "../../components/shared/SummaryPanel";
import MindMap from "../../components/shared/MindMap";
import useTranscription from "../../hooks/useTranscription";
import MeetingHistorySidebar from "../../components/layout/MeetingHistorySidebar";

export default function DefaultDashboard() {
  const { userName } = useAccessibility();
  const [activeTab, setActiveTab] = useState("transcript");

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const convertedTranscript = result?.text
    ? result.text.split(/(?<=[.?!])\s+/).map((sentence, idx) => ({
        time: `00:0${idx}:00`,
        speaker: result.text.startsWith("Error:") ? "System" : idx % 2 === 0 ? "Speaker A" : "Speaker B",
        text: sentence,
      }))
    : [];

  return (
    <div className="flex min-h-screen w-full bg-[#0F1117] overflow-hidden">
      <MeetingHistorySidebar />

      <main className="flex-1 min-h-screen flex flex-col items-center px-6 py-10 relative overflow-hidden bg-gradient-to-b from-[#0F1117] via-[#121527] to-[#0F1117]">
        {/* Local Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#2a2545] bg-[#16132a] text-[#9d99c0] hover:text-[#e8e4ff] hover:border-[#6D5FD5]/50 transition-all shadow-md"
            title="Go Back"
          >
            <span className="text-xl leading-none">←</span>
          </button>
        </div>

        <div className="w-full max-w-4xl relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6D5FD5]/10 border border-[#6D5FD5]/30 w-max mb-4 backdrop-blur-sm mx-auto">
              <span className="text-[11px] font-bold tracking-widest text-[#e8e4ff] uppercase">Workspace</span>
            </div>


            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl max-w-xl mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                {error}
              </div>
            )}
          </div>

          <div className="bg-[#13111c]/90 backdrop-blur-xl border border-[#2a2545] rounded-3xl p-8 shadow-2xl">
            <UploadZone onUpload={handleUpload} isProcessing={loading} disabled={hasProcessed} />

            {(hasProcessed || loading) && (
              <div className="mt-10 border-t border-[#2a2545] pt-10">
                <ResultTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                {loading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-3 border-[#6D5FD5] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#9d99c0] font-medium animate-pulse uppercase tracking-widest text-xs">Processing Content...</p>
                  </div>
                )}

                {!loading && (
                  <div className="mt-6 rounded-2xl overflow-hidden border border-[#2a2545] bg-[#16132a]/50">
                    {activeTab === "transcript" && <TranscriptPanel transcript={convertedTranscript} />}
                    {activeTab === "summary" && <SummaryPanel summary={result?.summary} />}
                    {activeTab === "mindmap" && <MindMap data={result?.mindmap} />}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(109,95,213,0.22),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(38,198,185,0.08),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(109,95,213,0.10),transparent_50%)]" />
        </div>
      </main>
    </div>
  );
}
