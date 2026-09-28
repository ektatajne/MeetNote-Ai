import { useState, useEffect } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import UploadZone from "../../components/shared/UploadZone";
import ResultTabs from "../../components/shared/ResultTabs";
import MindMap from "../../components/shared/MindMap";
import useTranscription from "../../hooks/useTranscription";

export default function ADHDDashboard() {
  const { setActiveProfile } = useAccessibility();
  const [activeTab, setActiveTab] = useState("transcript");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [chunkSize, setChunkSize] = useState("3 sentences");
  const [currentChunkIdx, setCurrentChunkIdx] = useState(0);

  useEffect(() => {
    setActiveProfile("adhd");
  }, [setActiveProfile]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const apiKey = localStorage.getItem("openai_api_key") || "";
  const { result, loading, error, transcribeFile } = useTranscription(apiKey);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (result && result.text) {
      setHasProcessed(true);
    }
  }, [result]);

  const handleUpload = async (file) => {
    setCurrentChunkIdx(0);
    await transcribeFile(file);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const chunks = result?.text ? result.text.match(/[^.?!]+[.?!]+/g) || [result.text] : [];

  let groupedChunks = [];
  let currentGroup = [];
  const itemsPerGroup = chunkSize === "1 sentence" ? 1 : chunkSize === "3 sentences" ? 3 : 5;

  chunks.forEach((chunk, i) => {
    currentGroup.push(chunk.trim());
    if (currentGroup.length === itemsPerGroup || i === chunks.length - 1) {
      groupedChunks.push(currentGroup.join(" "));
      currentGroup = [];
    }
  });

  if (groupedChunks.length === 0) groupedChunks = ["Upload a file to see transcription chunks here."];

  return (
    <div className="max-w-4xl mx-auto p-8 pb-32 bg-meet-bg min-h-full">
      <div className="bg-meet-card border border-meet-line border-l-[3px] border-l-meet-purple p-4 rounded-lg mt-2 mb-8 shadow-meet-sm">
        <h2 className="text-meet-text font-bold text-lg flex items-center">
          <span className="mr-2">🧠</span> ADHD Mode Active
        </h2>
        <p className="text-meet-muted text-sm mt-1 font-medium">
          Distraction-free interface. Focus tools and chunked information enabled.
        </p>
      </div>

      <div className="bg-meet-card rounded-2xl border border-meet-line p-8 flex flex-col items-center justify-center mb-10 shadow-meet-sm relative overflow-hidden">
        <h3 className="font-bold text-meet-muted tracking-widest text-sm mb-4 uppercase">🍅 Focus Session</h3>
        <div className="text-6xl font-mono font-bold text-meet-purpleLight tracking-tight mb-6">{formatTime(timeLeft)}</div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setTimerActive(true)}
            className="px-6 py-2 bg-meet-purple hover:bg-meet-purpleHover text-meet-text font-bold rounded-lg border border-[rgba(109,95,213,0.3)] transition"
          >
            ▶ Start
          </button>
          <button
            type="button"
            onClick={() => setTimerActive(false)}
            className="px-6 py-2 bg-transparent border border-meet-line text-meet-muted font-bold rounded-lg hover:text-meet-text hover:border-[rgba(109,95,213,0.3)] transition"
          >
            ⏸ Pause
          </button>
          <button
            type="button"
            onClick={() => {
              setTimerActive(false);
              setTimeLeft(25 * 60);
            }}
            className="px-6 py-2 bg-transparent border border-meet-line text-meet-muted font-bold rounded-lg hover:text-meet-text hover:border-[rgba(109,95,213,0.3)] transition"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-meet-input border border-red-500/40 text-red-300 rounded-lg">{error}</div>}

      <UploadZone onUpload={handleUpload} isProcessing={loading} disabled={hasProcessed} />

      {(hasProcessed || loading) && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <ResultTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {loading && (
            <div className="text-center py-20 text-meet-muted font-bold animate-pulse">Processing... stay focused!</div>
          )}

          {!loading && activeTab === "transcript" && (
            <div className="bg-meet-card border border-meet-line rounded-xl p-8 relative shadow-meet-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-meet-line pb-4 gap-4">
                <span className="text-sm font-bold text-meet-muted uppercase tracking-widest">View transcript in chunks of:</span>
                <select
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                  className="bg-meet-input border border-meet-line text-meet-text text-sm rounded-lg focus:ring-2 focus:ring-[rgba(109,95,213,0.45)] focus:border-meet-purple block p-2.5 font-semibold"
                >
                  <option value="1 sentence">1 sentence</option>
                  <option value="3 sentences">3 sentences</option>
                  <option value="1 paragraph">1 paragraph</option>
                </select>
              </div>

              <div className="flex justify-between items-center mb-8">
                <button
                  type="button"
                  onClick={() => setCurrentChunkIdx(Math.max(0, currentChunkIdx - 1))}
                  disabled={currentChunkIdx === 0}
                  className="text-meet-muted hover:text-meet-purpleLight font-bold disabled:opacity-30 p-2 transition"
                >
                  ← Previous
                </button>
                <div className="bg-meet-input text-meet-purpleLight text-sm font-bold px-4 py-1.5 rounded-lg border border-[rgba(109,95,213,0.3)]">
                  Chunk {currentChunkIdx + 1} of {groupedChunks.length}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentChunkIdx(Math.min(groupedChunks.length - 1, currentChunkIdx + 1))}
                  disabled={currentChunkIdx === groupedChunks.length - 1}
                  className="text-meet-muted hover:text-meet-purpleLight font-bold disabled:opacity-30 p-2 transition"
                >
                  Next →
                </button>
              </div>

              <div className="min-h-[150px] flex items-center justify-center p-6 bg-meet-input/50 rounded-xl border border-meet-line mb-8">
                <p className="text-2xl text-meet-text font-medium leading-relaxed text-center">{groupedChunks[currentChunkIdx]}</p>
              </div>

              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setCurrentChunkIdx(Math.min(groupedChunks.length - 1, currentChunkIdx + 1))}
                  className="bg-meet-purple hover:bg-meet-purpleHover text-meet-text font-bold text-xl px-12 py-4 rounded-lg border border-[rgba(109,95,213,0.3)] transition w-full max-w-sm shadow-meet-sm"
                >
                  ✓ Got it — Next →
                </button>

                <div className="w-full h-2 bg-meet-input rounded-full mt-8 overflow-hidden border border-meet-line">
                  <div
                    className="h-full bg-meet-purple transition-all duration-500"
                    style={{ width: `${((currentChunkIdx + 1) / groupedChunks.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "summary" && (
            <div className="bg-meet-card border border-meet-line rounded-xl p-8 shadow-meet-sm">
              <h3 className="text-xl font-bold border-b border-meet-line pb-4 mb-6 uppercase text-meet-purpleLight tracking-wide text-center">
                The 3 things that matter most:
              </h3>
              <div className="space-y-4">
                {(result?.summary || []).slice(0, 3).map((item, i) => (
                  <div key={i} className="bg-meet-input border border-meet-line p-6 rounded-xl flex items-start">
                    <span className="text-meet-purpleLight font-bold text-3xl mr-4 leading-none">{i + 1}</span>
                    <p className="text-xl font-bold text-meet-text">{item}</p>
                  </div>
                ))}
                {(!result?.summary || result.summary.length === 0) && (
                  <p className="text-center text-meet-muted italic">No summary points extracted yet.</p>
                )}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="px-6 py-3 bg-meet-input hover:bg-meet-purple/20 border border-meet-line text-meet-text rounded-lg text-sm font-bold flex items-center transition"
                >
                  <span className="mr-2">🔊</span> Read aloud
                </button>
              </div>
            </div>
          )}

          {!loading && activeTab === "mindmap" && <MindMap data={result?.mindmap} />}
        </div>
      )}
    </div>
  );
}
