import { useAccessibility } from "../../context/AccessibilityContext";
import { useEffect, useRef } from "react";

export default function TranscriptPanel({ transcript }) {
  const { fontSize, activeProfile } = useAccessibility();
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [transcript]);

  const getSpeakerColor = (speaker) => {
    if (activeProfile === "colorblind")
      return "bg-meet-input border border-meet-line text-meet-text px-2 py-0.5 rounded text-xs font-bold";
    const base = "bg-meet-input border text-xs font-bold ";
    const colors = {
      "Speaker A": `${base} border-[rgba(109,95,213,0.3)] text-meet-text`,
      "Speaker B": `${base} border-meet-line text-meet-purpleLight`,
      System: `${base} border-red-500/40 text-red-300`,
    };
    return colors[speaker] || `${base} border-meet-line text-meet-muted`;
  };

  const getSpeakerShape = (speaker) => {
    const shapes = {
      "Speaker A": "■",
      "Speaker B": "●",
      System: "▲",
    };
    return shapes[speaker] || "■";
  };

  if (!transcript || transcript.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto h-48 border border-meet-line bg-meet-card rounded-lg flex items-center justify-center mt-4">
        <p className="text-meet-muted italic">Transcript will appear here after processing.</p>
      </div>
    );
  }

  const isColorblind = activeProfile === "colorblind";
  const isHearing = activeProfile === "hearing";

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search transcript..."
            className="w-full pl-9 pr-4 py-2 bg-meet-input border border-meet-line rounded-lg text-sm text-meet-text placeholder:text-meet-muted focus:outline-none focus:ring-2 focus:ring-[rgba(109,95,213,0.45)] focus:border-meet-purple"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meet-muted">🔍</span>
        </div>
        <div className="flex space-x-2 shrink-0">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium border border-meet-line rounded-lg text-meet-muted hover:text-meet-text hover:bg-meet-input bg-transparent transition"
          >
            Copy
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium border border-meet-line rounded-lg text-meet-muted hover:text-meet-text hover:bg-meet-input bg-transparent transition"
          >
            Download
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        className="w-full max-h-[400px] overflow-y-auto rounded-lg border border-meet-line p-4 shadow-meet-sm space-y-3 bg-meet-card text-meet-text"
        style={{ fontSize: `${activeProfile === "hearing" ? Math.max(18, fontSize) : fontSize}px` }}
      >
        {transcript.map((line, idx) => (
          <div key={idx} className="flex items-start">
            <span className={`text-sm shrink-0 mt-0.5 mr-3 font-mono ${isColorblind ? "text-meet-muted" : "text-meet-muted"}`}>
              [{line.time}]
            </span>

            <div className="flex flex-wrap items-baseline">
              {isHearing && line.emotion && (
                <span className="mr-2 text-xl" title="Emotion detected">
                  {line.emotion}
                </span>
              )}

              <span className={`px-2 py-0.5 rounded mr-3 shrink-0 flex items-center ${getSpeakerColor(line.speaker)}`}>
                {isColorblind && <span className="mr-1.5">{getSpeakerShape(line.speaker)}</span>}
                {line.speaker}
              </span>

              <span className="leading-relaxed text-meet-text/95">{line.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
