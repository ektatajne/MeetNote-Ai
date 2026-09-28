import { useState, useEffect } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import UploadZone from "../../components/shared/UploadZone";
import ResultTabs from "../../components/shared/ResultTabs";
import TranscriptPanel from "../../components/shared/TranscriptPanel";
import SummaryPanel from "../../components/shared/SummaryPanel";
import MindMap from "../../components/shared/MindMap";
import useTranscription from "../../hooks/useTranscription";

export default function DyslexiaDashboard() {
  const { setActiveProfile } = useAccessibility();
  const [activeTab, setActiveTab] = useState("transcript");
  const [fontChoice, setFontChoice] = useState("Default");
  const [textSize, setTextSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState("Wide");
  const [paletteChoice, setPaletteChoice] = useState("Soft Cream");

  useEffect(() => {
    setActiveProfile("dyslexia");
  }, [setActiveProfile]);

  const apiKey = localStorage.getItem("openai_api_key") || "";
  const { result, loading, error, transcribeFile } = useTranscription(apiKey);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (result && result.text) {
      setHasProcessed(true);
    }
  }, [result]);

  const palettes = {
    "Soft Cream": {
      bg: "#F7F4EA",
      card: "#FFFDF7",
      border: "#D6CFAF",
      text: "#1E1B16",
      muted: "#5A5240",
      accent: "#4B61D1",
      chipInactiveBg: "#F1EAD6",
      chipInactiveText: "#3A352A",
      chipActiveBg: "#4B61D1",
      chipActiveText: "#FFFFFF",
    },
    "Warm Sand": {
      bg: "#F3E9D2",
      card: "#FFF8E8",
      border: "#CCB893",
      text: "#2B2216",
      muted: "#5E503A",
      accent: "#006B8F",
      chipInactiveBg: "#E9DABD",
      chipInactiveText: "#3D3020",
      chipActiveBg: "#006B8F",
      chipActiveText: "#FFFFFF",
    },
    "Cool Mint": {
      bg: "#EAF5EE",
      card: "#F7FCF9",
      border: "#B8D1C0",
      text: "#1B2820",
      muted: "#40564A",
      accent: "#2F6D4F",
      chipInactiveBg: "#DDEEE3",
      chipInactiveText: "#2D4237",
      chipActiveBg: "#2F6D4F",
      chipActiveText: "#FFFFFF",
    },
    "Blue Calm": {
      bg: "#EAF1FA",
      card: "#F8FBFF",
      border: "#B8C8DF",
      text: "#1A2535",
      muted: "#42566F",
      accent: "#385E9D",
      chipInactiveBg: "#DDE8F7",
      chipInactiveText: "#2B405D",
      chipActiveBg: "#385E9D",
      chipActiveText: "#FFFFFF",
    },
  };

  const palette = palettes[paletteChoice];

  const getContainerStyle = () => {
    const style = {
      fontFamily:
        fontChoice === "Arial" ? "Arial, sans-serif" : fontChoice === "OpenDyslexic Style" ? "'Comic Sans MS', sans-serif" : "inherit",
      fontSize: `${textSize}px`,
      letterSpacing: "0.08em",
      wordSpacing: "0.16em",
      backgroundColor: palette.bg,
      color: palette.text,
    };
    if (lineSpacing === "Wide") style.lineHeight = "2.2";
    if (lineSpacing === "Extra Wide") style.lineHeight = "3.0";
    return style;
  };

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

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition"
      style={
        active
          ? {
              backgroundColor: palette.chipActiveBg,
              color: palette.chipActiveText,
              borderColor: palette.chipActiveBg,
            }
          : {
              backgroundColor: palette.chipInactiveBg,
              color: palette.chipInactiveText,
              borderColor: palette.border,
            }
      }
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-full" style={getContainerStyle()}>
      <div className="max-w-4xl mx-auto p-8 pb-32">
        <div
          className="border border-l-[3px] p-4 rounded-lg mt-2 mb-8 shadow-meet-sm"
          style={{ backgroundColor: palette.card, borderColor: palette.border, borderLeftColor: palette.accent }}
        >
          <h2 className="font-bold text-lg flex items-center" style={{ color: palette.text }}>
            <span className="mr-2">📖</span> Dyslexia Mode Active
          </h2>
          <p className="text-sm mt-1 font-medium" style={{ color: palette.muted }}>
            Optimized for easier reading. No italic text, short lines, wide spacing.
          </p>
        </div>

        <div className="rounded-lg p-5 mb-8 shadow-meet-sm" style={{ backgroundColor: palette.card, border: `1px solid ${palette.border}` }}>
          <h3 className="font-bold mb-4 flex items-center uppercase tracking-widest text-xs" style={{ color: palette.muted }}>
            <span className="mr-2 text-base">⚙️</span> Reading Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: palette.muted }}>Font Style</label>
              <div className="flex flex-wrap gap-2">
                {["Default", "OpenDyslexic Style", "Arial"].map((f) => (
                  <Chip key={f} active={fontChoice === f} onClick={() => setFontChoice(f)}>
                    {f}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: palette.muted }}>Line Spacing</label>
              <div className="flex flex-wrap gap-2">
                {["Normal", "Wide", "Extra Wide"].map((s) => (
                  <Chip key={s} active={lineSpacing === s} onClick={() => setLineSpacing(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: palette.muted }}>
                Color Palette
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(palettes).map((p) => (
                  <Chip key={p} active={paletteChoice === p} onClick={() => setPaletteChoice(p)}>
                    {p}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: palette.muted }}>Text Size</label>
              <input
                type="range"
                min="16"
                max="28"
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value, 10))}
                className="w-full"
                style={{ accentColor: palette.accent }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border rounded-lg" style={{ backgroundColor: "#3A1F25", borderColor: "#B35A64", color: "#FFD1D6" }}>
            {error}
          </div>
        )}

        <UploadZone onUpload={handleUpload} isProcessing={loading} disabled={hasProcessed} />

        {(hasProcessed || loading) && (
          <div className="mt-8">
            <ResultTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {loading && <div className="text-center py-20 text-meet-muted animate-pulse">Processing Audio...</div>}

            {!loading && (
              <div className="relative mt-4">
                {activeTab === "transcript" && (
                  <div className="absolute -top-12 right-0">
                    <button
                      type="button"
                      className="px-4 py-2 bg-meet-input hover:bg-meet-purple/30 text-meet-text border border-meet-line rounded-lg text-sm font-bold flex items-center shadow-meet-sm transition"
                    >
                      <span className="mr-2">🔊</span> Read Aloud
                    </button>
                  </div>
                )}
                {activeTab === "transcript" && <TranscriptPanel transcript={convertedTranscript} />}
                {activeTab === "summary" && <SummaryPanel summary={result?.summary} />}
                {activeTab === "mindmap" && <MindMap data={result?.mindmap} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
