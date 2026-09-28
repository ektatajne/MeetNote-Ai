import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MeetingHistorySidebar from "../components/layout/MeetingHistorySidebar";

const waveformHeights = [18, 26, 14, 28, 22, 30, 12, 20, 32, 16, 25, 14, 30, 22, 18, 27, 15, 31, 23, 19];
const speakerColors = ["bg-[#6D5FD5]", "bg-[#26c6b9]", "bg-[#ff7a6e]"];
const speakerGradients = [
  "from-[#6D5FD5]/20 to-[#6D5FD5]/5",
  "from-[#26c6b9]/20 to-[#26c6b9]/5",
  "from-[#ff7a6e]/20 to-[#ff7a6e]/5"
];

function sentenceToHighlights(text) {
  return text
    .split(" ")
    .filter((word) => word.length > 5)
    .slice(0, 2)
    .map((word) => word.replace(/[^\w]/g, ""));
}

function highlightText(text, words) {
  if (!words?.length) return text;
  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");
  return text.split(regex).map((part, index) => {
    const isHighlighted = words.some((word) => word.toLowerCase() === part.toLowerCase());
    return isHighlighted ? (
      <span key={`${part}-${index}`} className="rounded px-1.5 py-0.5 bg-[#6D5FD5]/30 text-[#e8e4ff] font-medium border border-[#6D5FD5]/40 shadow-[0_0_10px_rgba(109,95,213,0.2)]">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

function sanitizeMermaidLabel(label) {
  const cleaned = String(label || "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Topic";
  return cleaned.split(" ").slice(0, 4).join(" ");
}

function buildMermaidMindmap(mindmap) {
  const center = sanitizeMermaidLabel(mindmap?.center || "Meeting Insights");
  const nodes = Array.isArray(mindmap?.nodes) ? mindmap.nodes : [];

  const lines = ["mindmap", `  root((${center}))`];

  if (nodes.length === 0) {
    lines.push(`    Analyzing Audio...`);
    return lines.join("\n");
  }

  nodes.slice(0, 6).forEach((node) => {
    const parent = sanitizeMermaidLabel(node?.label || "Topic");
    lines.push(`    ${parent}`);
    const children = Array.isArray(node?.children) ? node.children : [];
    children.slice(0, 6).forEach((child) => {
      const c = sanitizeMermaidLabel(child);
      lines.push(`      ${c}`);
    });
  });

  return lines.join("\n");
}

function MermaidMindmap({ code, onSvg }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;

    async function ensureMermaid() {
      if (window.mermaid) return;
      setStatus("loading");

      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-mermaid="true"]');
        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
        script.async = true;
        script.dataset.mermaid = "true";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    async function render() {
      try {
        await ensureMermaid();
        if (cancelled) return;

        const mermaid = window.mermaid;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          themeVariables: {
            background: "transparent",
            primaryColor: "#6D5FD5",
            primaryBorderColor: "#8b7ff0",
            primaryTextColor: "#ffffff",
            lineColor: "#6D5FD5",
            secondaryColor: "#26c6b9",
            tertiaryColor: "#ff7a6e",
          },
        });

        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";

        const id = `mm-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (cancelled) return;

        containerRef.current.innerHTML = svg;
        if (typeof onSvg === "function") onSvg(svg);
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.width = "100%";
          svgEl.style.height = "auto";
        }
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [code, onSvg]);

  return (
    <div className="w-full flex items-center justify-center min-h-[200px] relative">
      <div ref={containerRef} className="w-full max-w-[85%] overflow-hidden flex justify-center scale-90 origin-center" />
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#6D5FD5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#9d99c0] font-medium tracking-wider uppercase">Generating Mind Map...</p>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-[#ff7a6e] bg-[#ff7a6e]/10 rounded-xl border border-[#ff7a6e]/20">
          Mind map failed to render.
        </div>
      )}
    </div>
  );
}

export default function MeetingAnalysisView({ sourceAudioName = "Uploaded Audio Meeting", analysisResult }) {
  const navigate = useNavigate();

  const [meetingHistory, setMeetingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("meetnote_history");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeMeetingId, setActiveMeetingId] = useState("current");
  const [isPlaying, setIsPlaying] = useState(false);
  const [mindmapSvg, setMindmapSvg] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTargetLang, setTranslationTargetLang] = useState(analysisResult?.target_lang || "hi");
  const [translatedText, setTranslatedText] = useState("");
  const [translationStatus, setTranslationStatus] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeTranslationLang, setActiveTranslationLang] = useState(analysisResult?.target_lang || "");

  useEffect(() => {
    const hasData = analysisResult?.segments?.length > 0 || analysisResult?.speaker_turns?.length > 0 || analysisResult?.summary;
    
    if (analysisResult && sourceAudioName && hasData) {
      setMeetingHistory(prev => {
        const isDuplicate = prev.some(m => m.title === sourceAudioName);
        if (isDuplicate) return prev;
        
        const newMeeting = {
          id: `m_${Date.now()}`,
          title: sourceAudioName,
          date: new Date().toLocaleDateString() + " · " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        };
        const newHistory = [newMeeting, ...prev].slice(0, 15);
        localStorage.setItem("meetnote_history", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [analysisResult, sourceAudioName]);

  const transcriptTurns = useMemo(() => {
    const turns = analysisResult?.speaker_turns || analysisResult?.segments || [];
    if (!turns.length) return [];
    return turns.slice(0, 40).map((turn, index) => {
      const speaker = turn.speaker || `Speaker ${String.fromCharCode(65 + (index % 3))}`;
      const speakerIdx = index % 3;
      const initials = speaker
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return {
        id: turn.id || `rt-${index}`,
        initials,
        speaker,
        timestamp: turn.timestamp || "00:00",
        color: speakerColors[speakerIdx],
        text: (turn.text || "").trim(),
        highlights: sentenceToHighlights(turn.text || ""),
      };
    });
  }, [analysisResult]);

  // Check if transcript is already translated (from audio page translation)
  const isAlreadyTranslated = useMemo(() => {
    return Boolean(analysisResult?.target_lang && analysisResult.target_lang.trim() !== '');
  }, [analysisResult]);

  // Auto-show translation if already translated
  useEffect(() => {
    if (isAlreadyTranslated) {
      const fullText = transcriptTurns.map(turn => turn.text).join(' ');
      setTranslatedText(fullText);
      setShowTranslation(true);
      setActiveTranslationLang(analysisResult.target_lang);
      setTranslationStatus("Translation completed");
    }
  }, [isAlreadyTranslated, transcriptTurns, analysisResult?.target_lang]);

  const wordsByTurnTime = useMemo(() => {
    const words = analysisResult?.words || [];
    if (!words.length) return {};
    return words.reduce((acc, word) => {
      const ts = word.timestamp || "00:00";
      if (!acc[ts]) acc[ts] = [];
      if (acc[ts].length < 4) acc[ts].push(word.word);
      return acc;
    }, {});
  }, [analysisResult]);

  const mindmapData = useMemo(
    () =>
      analysisResult?.mindmap || {
        center: "Meeting",
        nodes: [],
      },
    [analysisResult]
  );

  const currentMeeting = useMemo(() => {
    const selected = meetingHistory.find((meeting) => meeting.id === activeMeetingId);
    if (selected) return selected;
    return {
      id: "current",
      title: sourceAudioName || "Uploaded Audio Meeting",
      date: "Now · Current analysis",
    };
  }, [activeMeetingId, meetingHistory, sourceAudioName]);

  const speakersCount = new Set(transcriptTurns.map((turn) => turn.speaker)).size;
  const durationLabel = `${Math.max(transcriptTurns.length * 0.5, 1).toFixed(1)}m`;

  const progressRatio = 0.42;
  const currentTime = transcriptTurns[0]?.timestamp || "00:00";
  const totalTime = transcriptTurns[transcriptTurns.length - 1]?.timestamp || "00:00";

  const mermaidMindmapCode = useMemo(() => buildMermaidMindmap(mindmapData), [mindmapData]);
  const handleMindmapSvg = useCallback((svg) => {
    setMindmapSvg((prev) => (prev === svg ? prev : svg));
  }, []);

  const shortSummary = useMemo(() => {
    const summaryLines = Array.isArray(analysisResult?.summary) ? analysisResult.summary : [];
    const fromSummary = summaryLines.filter(Boolean).join(" ").trim();
    if (fromSummary) return fromSummary;

    const fromTranscript = transcriptTurns
      .slice(0, 3)
      .map((t) => t.text)
      .filter(Boolean)
      .join(" ")
      .trim();
    return fromTranscript;
  }, [analysisResult, transcriptTurns]);

  const semantic = analysisResult?.semantic;

  const handleTranslateTranscript = async () => {
    // If translation for THIS language already exists, just show it
    if (activeTranslationLang === translationTargetLang && translatedText) {
      setShowTranslation(true);
      setTranslationStatus("Translation completed");
      return;
    }

    setIsTranslating(true);
    setTranslationStatus("Translating transcript...");

    try {
      const languageNames = {
        'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
        'mr': 'Marathi', 'gu': 'Gujarati', 'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu',
        'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'zh': 'Chinese', 'ja': 'Japanese',
        'ko': 'Korean', 'ar': 'Arabic', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'nl': 'Dutch'
      };

      const langName = languageNames[translationTargetLang] || translationTargetLang;
      setTranslationStatus(`Translating to ${langName}...`);

      // Create full transcript text
      const fullTranscript = transcriptTurns.map(turn => turn.text).join(' ');

      // Call translation API
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiBase}/translate-text/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullTranscript,
          target_lang: translationTargetLang,
          source_lang: 'en'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Translation failed');
      }

      const result = await response.json();
      setTranslatedText(result.translated_text || fullTranscript);
      setActiveTranslationLang(translationTargetLang);
      setShowTranslation(true);
      setTranslationStatus(`Translation to ${langName} completed!`);

    } catch (error) {
      console.error('Translation error:', error);
      setTranslationStatus(`Translation failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsTranslating(false);
        setTranslationStatus("");
      }, 3000);
    }
  };

  const handleExportPdf = () => {
    const title = (currentMeeting?.title || sourceAudioName || "Meeting").toString();
    const safeTitle = title.replace(/[^a-zA-Z0-9 ]+/g, " ").trim() || "Meeting";

    const summaryHtml = (shortSummary || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svgHtml = mindmapSvg || "";

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle} Export</title>
  <style>
    body{font-family:Segoe UI,system-ui,sans-serif;margin:24px;color:#111}
    h1{font-size:18px;margin:0 0 8px 0}
    .meta{color:#444;font-size:12px;margin-bottom:16px}
    .card{border:1px solid #ddd;border-radius:12px;padding:14px;margin-bottom:14px}
    .label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#555;margin:0 0 8px 0}
    .summary{font-size:13px;line-height:1.5;white-space:pre-wrap}
    .mindmap svg{max-width:100%;height:auto}
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  <div class="meta">Source: ${sourceAudioName}</div>
  <div class="card mindmap">
    <div class="label">Mind Map</div>
    ${svgHtml || `<pre>${mermaidMindmapCode}</pre>`}
  </div>
  <div class="card">
    <div class="label">Summary</div>
    <div class="summary">${summaryHtml || "No summary available."}</div>
  </div>
  <script>window.onload=()=>window.print()</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1117] text-[#e8e4ff] font-['Segoe_UI',system-ui,sans-serif] flex">
      <MeetingHistorySidebar 
        currentMeetingTitle={currentMeeting.title}
        activeMeetingId={activeMeetingId}
        onSelectMeeting={(id) => setActiveMeetingId(id)}
      />
      
      <main className="flex-1 min-h-screen flex flex-col bg-[#0F1117]">
          <section className="px-6 py-3 border-b border-[#2a2545] flex items-center gap-4">
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#2a2545] bg-[#16132a] text-[#9d99c0] hover:text-[#e8e4ff] hover:border-[#6D5FD5]/50 transition-all shadow-md"
              title="Back to Dashboard"
            >
              <span className="text-xl leading-none">←</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{currentMeeting.title}</h2>

              <p className="text-xs text-[#9d99c0] truncate">
                {currentMeeting.date} · {durationLabel} · {speakersCount || 0} Speakers · Source: {sourceAudioName}
              </p>
            </div>
          </section>

          <section className="px-6 py-2 border-b border-[#2a2545]">
            <div className="bg-[#13111c] border border-[#2a2545] rounded-xl px-4 py-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPlaying((value) => !value)}
                className="h-9 w-9 rounded-full bg-[#6D5FD5] hover:bg-[#5e50cb] transition flex items-center justify-center text-white shrink-0"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <div className="flex-1 flex items-end gap-1 h-7">
                {waveformHeights.map((height, index) => {
                  const active = index / waveformHeights.length <= progressRatio;
                  return (
                    <span
                      key={`bar-${index}`}
                      className={`flex-1 rounded-sm ${active ? "bg-[#6D5FD5]" : "bg-[#2a2545]"}`}
                      style={{ height: `${Math.max(8, Math.round(height * 0.65))}px` }}
                    />
                  );
                })}
              </div>

              <p className="text-xs text-[#9d99c0] shrink-0">
                {currentTime} / {totalTime}
              </p>
              <span className="text-xs bg-[#16132a] border border-[#2a2545] rounded-md px-2 py-1 shrink-0">1x</span>
            </div>
          </section>

          <section className="flex-1 min-h-0 px-6 py-3 flex gap-4 pb-20">
            <div className="flex-[0_0_56%] min-h-[400px] bg-[#13111c] border border-[#2a2545] rounded-xl p-3 overflow-y-auto max-h-[calc(100vh-220px)]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xs uppercase tracking-[0.15em] text-[#9d99c0]">Transcript</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={translationTargetLang}
                    onChange={(e) => setTranslationTargetLang(e.target.value)}
                    className="text-[10px] rounded-md bg-[#16132a] border border-[#2a2545] px-2 py-1 text-[#e8e4ff] hover:border-[#6D5FD5] transition-colors"
                    title="Choose target language for translation"
                    disabled={isTranslating}
                  >
                    <option value="hi">🇮🇳 Hindi</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="mr">🇮🇳 Marathi</option>
                    <option value="gu">🇮🇳 Gujarati</option>
                    <option value="bn">🇮🇳 Bengali</option>
                    <option value="ta">🇮🇳 Tamil</option>
                    <option value="te">🇮🇳 Telugu</option>
                    <option value="zh">🇨🇳 Chinese</option>
                    <option value="ja">🇯🇵 Japanese</option>
                    <option value="ar">🇸🇦 Arabic</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleTranslateTranscript}
                    disabled={isTranslating || transcriptTurns.length === 0}
                    className={`text-[10px] font-semibold rounded-md border transition px-2 py-1 flex items-center gap-1 ${isTranslating || transcriptTurns.length === 0
                        ? 'border-[#2a2545] bg-[#5e5a80] text-[#9d99c0] cursor-not-allowed'
                        : 'border-[#2a2545] bg-[#6D5FD5] hover:bg-[#5e50cb] text-white'
                      }`}
                    title="Translate entire transcript to selected language"
                  >
                    {isTranslating ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Translating...
                      </>
                    ) : (activeTranslationLang === translationTargetLang && translatedText) ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View Translation
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                        </svg>
                        Translate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {translationStatus && (
                <div className={`mb-2 p-2 rounded-lg text-xs ${translationStatus.includes('completed')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                    : translationStatus.includes('failed')
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                      : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
                  }`}>
                  <div className="flex items-center gap-2">
                    {translationStatus.includes('Translating') && (
                      <svg className="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    )}
                    {translationStatus.includes('completed') && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {translationStatus.includes('failed') && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{translationStatus}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {transcriptTurns.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {transcriptTurns.map((turn) => (
                        <article key={turn.id} className="rounded-lg border border-[#2a2545] bg-[#16132a] p-2.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`h-7 w-7 rounded-full ${turn.color} flex items-center justify-center text-[10px] font-semibold`}>
                              {turn.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{turn.speaker}</p>
                              <p className="text-[11px] text-[#9d99c0]">{turn.timestamp}</p>
                            </div>
                          </div>
                          <p className="text-xs leading-relaxed text-[#e8e4ff]">{highlightText(turn.text, turn.highlights)}</p>
                          {wordsByTurnTime[turn.timestamp]?.length ? (
                            <p className="mt-1 text-[10px] text-[#9d99c0] truncate">Words: {wordsByTurnTime[turn.timestamp].join(" · ")}</p>
                          ) : null}
                        </article>
                      ))}
                    </div>

                    {showTranslation && translatedText && (
                      <div className="rounded-lg border border-[#26c6b9] bg-[#16132a] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-[#26c6b9]">Translated Transcript</h4>
                          <button
                            type="button"
                            onClick={() => setShowTranslation(false)}
                            className="text-[10px] text-[#9d99c0] hover:text-[#e8e4ff] transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs leading-relaxed text-[#26c6b9] whitespace-pre-wrap">
                          {translatedText}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-md border border-dashed border-[#2a2545] bg-[#16132a] p-4 text-sm text-[#9d99c0]">
                    Transcript will appear after local audio processing completes.
                  </div>
                )}
              </div>
            </div>

            <aside className="flex-1 min-h-[400px] overflow-y-auto max-h-[calc(100vh-220px)]">
              <div className="min-h-full bg-[#13111c] border border-[#2a2545] rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold">Mind Map</h4>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="text-xs font-semibold rounded-md bg-[#6D5FD5] hover:bg-[#5e50cb] transition px-3 py-1.5 text-white"
                    title="Export mind map and summary as PDF"
                  >
                    Export PDF
                  </button>
                </div>

                <div className="mt-3">
                  <MermaidMindmap
                    code={mermaidMindmapCode}
                    onSvg={handleMindmapSvg}
                  />
                </div>


                {semantic && (
                  <div className="mt-3 rounded-lg border border-[#2a2545] bg-[#16132a] px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#9d99c0]">Semantic Analysis</p>
                    <div className="mt-2 space-y-2 text-xs text-[#e8e4ff]">
                      <p className="text-[#9d99c0]">
                        Sentiment: <span className="text-[#e8e4ff] font-semibold">{semantic?.sentiment?.overall?.label || "Neutral"}</span>
                      </p>

                      {Array.isArray(semantic.topics) && semantic.topics.length > 0 && (
                        <div>
                          <p className="text-[#9d99c0]">Topics</p>
                          <p className="mt-1">{semantic.topics.slice(0, 6).join(" · ")}</p>
                        </div>
                      )}

                      {Array.isArray(semantic.decisions) && semantic.decisions.length > 0 && (
                        <div>
                          <p className="text-[#9d99c0]">Decisions</p>
                          <ul className="mt-1 list-disc pl-4 space-y-1">
                            {semantic.decisions.slice(0, 3).map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(semantic.action_items) && semantic.action_items.length > 0 && (
                        <div>
                          <p className="text-[#9d99c0]">Action items</p>
                          <ul className="mt-1 list-disc pl-4 space-y-1">
                            {semantic.action_items.slice(0, 3).map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(semantic.questions) && semantic.questions.length > 0 && (
                        <div>
                          <p className="text-[#9d99c0]">Questions</p>
                          <ul className="mt-1 list-disc pl-4 space-y-1">
                            {semantic.questions.slice(0, 2).map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(semantic.risks) && semantic.risks.length > 0 && (
                        <div>
                          <p className="text-[#9d99c0]">Risks blockers</p>
                          <ul className="mt-1 list-disc pl-4 space-y-1">
                            {semantic.risks.slice(0, 2).map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <details className="mt-3 rounded-lg border border-[#2a2545] bg-[#16132a] px-3 py-2">
                  <summary className="cursor-pointer text-xs text-[#9d99c0] select-none">Mermaid (mindmap) source</summary>
                  <pre className="mt-2 text-[11px] text-[#e8e4ff] overflow-x-auto whitespace-pre-wrap">
                    {mermaidMindmapCode}
                  </pre>
                </details>
              </div>
            </aside>
          </section>
        </main>
    </div>
  );
}
