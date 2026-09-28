import { useState } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import SignLanguageInterpretation from "./SignLanguageInterpretation";

const tabBtnBase =
  "flex-1 py-3 px-3 sm:px-4 flex items-center justify-center font-semibold transition border-r border-meet-line last:border-r-0 text-sm sm:text-base";

function FeatureTabs({ activeFeature, onSelect }) {
  const tabs = [
    { id: "mindmap", label: "Mind Map", icon: "🧠" },
    { id: "emotion", label: "Emotion Detection", icon: "😊" },
    { id: "speaker", label: "Speaker Identity", icon: "🎤" },
  ];

  return (
    <div className="flex w-full border border-meet-line rounded-lg overflow-hidden bg-meet-card shadow-meet-sm">
      {tabs.map((t) => {
        const active = activeFeature === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`${tabBtnBase} ${
              active ? "bg-meet-purple text-meet-text m-0.5 rounded-lg border border-[rgba(109,95,213,0.3)]" : "text-meet-muted bg-transparent hover:bg-meet-input/60"
            }`}
          >
            <span className="mr-2 shrink-0">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

function CardShell({ title, children, className = "" }) {
  return (
    <div className={`rounded-lg border border-meet-line bg-meet-card shadow-meet-sm flex flex-col overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-meet-line bg-meet-input/30">
          <h2 className="text-sm font-bold text-meet-text tracking-tight">{title}</h2>
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function MindMapPlaceholder() {
  return (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-meet-muted border border-dashed border-meet-line rounded-lg m-4 bg-meet-input/30">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-meet-input border border-[rgba(109,95,213,0.3)] text-3xl text-meet-purpleLight mb-3">
        🗺️
      </span>
      <p className="font-bold text-meet-text">Mind Map View</p>
      <p className="text-sm mt-1 text-center max-w-xs text-meet-muted">Interactive graph will render here from meeting topics.</p>
    </div>
  );
}

function EmotionPlaceholder({ segments }) {
  const maxVal = Math.max(...segments.map((s) => s.value), 1);
  return (
    <div className="p-4 space-y-4">
      <p className="text-xs font-bold text-meet-muted uppercase tracking-widest">Emotion by segment</p>
      <div className="space-y-3">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-meet-muted w-24 shrink-0 font-mono">{s.timeRange}</span>
            <div className="flex-1 h-8 bg-meet-input rounded-md overflow-hidden border border-meet-line">
              <div
                className="h-full bg-gradient-to-r from-meet-purple to-meet-purpleLight flex items-center px-2 min-w-[2rem]"
                style={{ width: `${(s.value / maxVal) * 100}%` }}
              >
                <span className="text-xs font-bold text-meet-text truncate">{s.label}</span>
              </div>
            </div>
            <span className="text-xs text-meet-muted w-20 shrink-0">{s.speaker}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeakerList({ speakers }) {
  return (
    <ul className="p-4 space-y-3">
      {speakers.map((sp, i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-3 p-3 rounded-lg border border-meet-line bg-meet-input/40"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-xs font-bold shrink-0 text-meet-text bg-meet-input border border-[rgba(109,95,213,0.3)]">
              {sp.name}
            </span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-meet-text">{sp.talkTimeLabel}</p>
            <p className="text-xs text-meet-muted">{sp.talkTimePercent}% of airtime</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MeetingAnalysisView({
  summaryText,
  meetingVideoUrl = "",
  meetingVideoExternallyControlled = false,
  signLanguageVideoUrl,
  meetingData,
  onExportPDF,
}) {
  const [activeFeature, setActiveFeature] = useState("mindmap");
  const { fontSize } = useAccessibility();

  const emotionSegments = meetingData?.emotionSegments?.length
    ? meetingData.emotionSegments
    : [
        { speaker: "Speaker A", label: "Neutral", value: 40, timeRange: "0:00–2:10" },
        { speaker: "Speaker B", label: "Positive", value: 72, timeRange: "2:10–5:00" },
        { speaker: "Speaker A", label: "Focused", value: 55, timeRange: "5:00–8:30" },
      ];

  const speakers = meetingData?.speakers?.length
    ? meetingData.speakers
    : [
        { name: "Speaker A", talkTimePercent: 58, talkTimeLabel: "12m 40s" },
        { name: "Speaker B", talkTimePercent: 42, talkTimeLabel: "9m 15s" },
      ];

  return (
    <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-28 font-sans bg-[#0F1117] min-h-full">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8">
        <div className="w-full flex flex-col gap-6 shrink-0 h-full">
          <div className="w-full h-full">
            <SignLanguageInterpretation
              meetingVideoUrl={meetingVideoUrl}
              avatarVideoUrl={signLanguageVideoUrl}
              externallyControlled={meetingVideoExternallyControlled}
              onExportPDF={onExportPDF}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
