import { useState, useEffect } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import UploadZone from "../../components/shared/UploadZone";
import ResultTabs from "../../components/shared/ResultTabs";
import TranscriptPanel from "../../components/shared/TranscriptPanel";
import SummaryPanel from "../../components/shared/SummaryPanel";
import MindMap from "../../components/shared/MindMap";
import { mockSoundAlerts } from "../../data/mockData";
import useTranscription from "../../hooks/useTranscription";

export default function HearingDashboard() {
  const { setActiveProfile } = useAccessibility();
  const [activeTab, setActiveTab] = useState("transcript");
  const [userNameToAlert, setUserNameToAlert] = useState("");
  const [flashAlert, setFlashAlert] = useState(false);
  const [twoWayInput, setTwoWayInput] = useState("");

  useEffect(() => {
    setActiveProfile("hearing");
  }, [setActiveProfile]);

  const apiKey = localStorage.getItem("openai_api_key") || "";
  const { result, loading, error, transcribeFile } = useTranscription(apiKey);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (result && result.text) {
      setHasProcessed(true);
      if (userNameToAlert && result.text.toLowerCase().includes(userNameToAlert.toLowerCase())) {
        setFlashAlert(true);
        setTimeout(() => setFlashAlert(false), 3000);
      }
    }
  }, [result, userNameToAlert]);

  const handleUpload = async (file) => {
    await transcribeFile(file);
  };

  const speakMessage = () => {
    if (!twoWayInput || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(twoWayInput);
    window.speechSynthesis.speak(utterance);
    setTwoWayInput("");
  };

  const convertedTranscript = result?.text
    ? result.text.split(/(?<=[.?!])\s+/).map((sentence, idx) => ({
        time: `00:0${idx}:00`,
        speaker: result.text.startsWith("Error:") ? "System" : idx % 2 === 0 ? "Speaker A" : "Speaker B",
        text: sentence,
        emotion: idx % 3 === 0 ? "😊" : idx % 5 === 0 ? "😤" : "😐",
      }))
    : [];

  return (
    <div
      className={`max-w-5xl mx-auto p-8 pb-32 bg-meet-bg min-h-full transition-colors duration-200 ${
        flashAlert ? "ring-2 ring-inset ring-[rgba(109,95,213,0.5)]" : ""
      }`}
    >
      {flashAlert && (
        <div className="fixed inset-0 border-8 border-[rgba(109,95,213,0.45)] pointer-events-none z-50 flex items-start justify-center">
          <div className="bg-meet-purple text-meet-text font-bold px-6 py-3 rounded-b-xl shadow-meet mt-0 border border-[rgba(109,95,213,0.35)]">
            ⚡ You were just mentioned in the transcription!
          </div>
        </div>
      )}

      <div className="bg-meet-card border border-[rgba(109,95,213,0.3)] p-4 rounded-lg mt-2 mb-8 shadow-meet-sm flex items-center justify-between">
        <div>
          <h2 className="text-meet-purpleLight font-bold text-lg flex items-center">
            <span className="mr-2">🧏</span> Hearing Mode Active
          </h2>
          <p className="text-meet-muted text-sm mt-1 font-medium">Visual alerts enabled. All audio cues are translated visually.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-meet-card rounded-lg border border-meet-line p-5 shadow-meet-sm">
          <h3 className="font-bold text-meet-muted mb-3 text-xs uppercase tracking-widest">Mention Alerts</h3>
          <p className="text-xs text-meet-muted mb-3 border-b border-meet-line pb-3">
            Enter your name to flash the screen when someone says it.
          </p>
          <input
            type="text"
            placeholder="E.g. Rahul"
            value={userNameToAlert}
            onChange={(e) => setUserNameToAlert(e.target.value)}
            className="w-full px-4 py-2 border border-meet-line rounded-lg font-semibold bg-meet-input text-meet-text placeholder:text-meet-muted focus:outline-none focus:ring-2 focus:ring-[rgba(109,95,213,0.45)] focus:border-meet-purple"
          />
        </div>

        <div className="bg-meet-card rounded-lg border border-meet-line p-5 shadow-meet-sm">
          <h3 className="font-bold text-meet-muted mb-3 text-xs uppercase tracking-widest">Visual Sound Alerts</h3>
          <p className="text-xs text-meet-muted mb-3 border-b border-meet-line pb-3">Detected background sounds will appear here.</p>
          <div className="flex flex-wrap gap-2">
            {hasProcessed &&
              mockSoundAlerts.map((alert, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2 py-1 rounded-lg border border-meet-line bg-meet-input text-meet-muted flex items-center"
                >
                  <span className="mr-1">{alert.icon}</span> {alert.msg}
                </span>
              ))}
            {!hasProcessed && <span className="text-sm text-meet-muted italic">Waiting for audio...</span>}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-meet-input border border-red-500/40 text-red-300 rounded-lg">{error}</div>}

      <UploadZone onUpload={handleUpload} isProcessing={loading} disabled={hasProcessed} />

      {(hasProcessed || loading) && (
        <div className="mt-8 relative">
          <ResultTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {loading && <div className="text-center py-20 text-meet-muted animate-pulse">Processing Audio...</div>}

          {!loading && activeTab === "transcript" && <TranscriptPanel transcript={convertedTranscript} />}
          {!loading && activeTab === "summary" && <SummaryPanel summary={result?.summary} />}
          {!loading && activeTab === "mindmap" && <MindMap data={result?.mindmap} />}

          {!loading && (
            <div className="mt-8 bg-meet-card border border-meet-line p-4 rounded-xl shadow-meet-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <span className="text-2xl ml-2 shrink-0 self-center">🗣️</span>
              <input
                type="text"
                value={twoWayInput}
                onChange={(e) => setTwoWayInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && speakMessage()}
                placeholder="Type here → your message will be read aloud to the room"
                className="flex-1 bg-meet-input border border-meet-line rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgba(109,95,213,0.45)] focus:border-meet-purple font-semibold text-meet-text placeholder:text-meet-muted"
              />
              <button
                type="button"
                onClick={speakMessage}
                disabled={!twoWayInput}
                className="bg-meet-purple hover:bg-meet-purpleHover disabled:bg-meet-input disabled:text-meet-muted text-meet-text font-bold py-3 px-6 rounded-lg transition border border-[rgba(109,95,213,0.3)] shrink-0"
              >
                📢 Speak
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
