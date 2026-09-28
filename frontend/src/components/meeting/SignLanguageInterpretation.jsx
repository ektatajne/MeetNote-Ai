import { useCallback, useEffect, useRef, useState } from "react";
import AvatarCanvas from "../AvatarCanvas";
import MindMap from "../shared/MindMap";

function FeatureTabs({ activeFeature, onSelect, onExportPDF }) {
  const tabs = [
    { id: "mindmap", label: "Mind Map", icon: "🧠" },
    { id: "emotion", label: "Emotion Detection", icon: "😊" },
    { id: "speaker", label: "Speaker Identity", icon: "🎤" },
  ];

  return (
    <div className="flex flex-row w-full gap-2 bg-[#0F1117]/80 rounded-2xl p-1.5 border border-[#2a2545] shadow-inner backdrop-blur-md">
      {tabs.map((t) => {
        const active = activeFeature === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              active 
                ? "bg-gradient-to-r from-[#6D5FD5] to-[#26c6b9] text-white shadow-[0_4px_15px_rgba(109,95,213,0.4)] transform scale-[1.02]" 
                : "text-[#9d99c0] hover:text-[#e8e4ff] hover:bg-[#16132a]"
            }`}
          >
            <span className={active ? "animate-bounce" : ""}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function SignLanguageInterpretation({
  meetingVideoUrl = "",
  avatarVideoUrl = "",
  className = "",
  onMeetingVideoFile,
  onExportPDF,
  externallyControlled = false,
}) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [localVideoUrl, setLocalVideoUrl] = useState(null);
  const [activeFeature, setActiveFeature] = useState("mindmap");
  const [transcriptionText, setTranscriptionText] = useState("");
  const [summary, setSummary] = useState("Waiting for transcript to generate summary...");
  const [sentenceChunk, setSentenceChunk] = useState("");
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const lastChunkRef = useRef("");
  
  // Mock mindmap data for demonstration
  const [mindmapData, setMindmapData] = useState({
    center: "Meeting Topics",
    nodes: [
      {
        label: "Discussion",
        color: "cyan",
        children: ["Agenda", "Timeline", "Goals"]
      },
      {
        label: "Participants", 
        color: "amber",
        children: ["Speakers", "Roles", "Contributions"]
      },
      {
        label: "Actions",
        color: "red", 
        children: ["Tasks", "Deadlines", "Follow-ups"]
      }
    ]
  });

  useEffect(() => {
    return () => {
      if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    };
  }, [localVideoUrl]);

  useEffect(() => {
    // Placeholder stream until Whisper live text is wired here.
    const samples = [
      "Hello everyone welcome to the meeting",
      "We need help with the morning report",
      "Please review the name list and water supply",
      "Thank you for your support",
    ];
    let idx = 0;
    setTranscriptionText(samples[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % samples.length;
      setTranscriptionText(samples[idx]);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const cleanTranscript = (text) => {
    return text
      .replace(/\b(uh|um|okay|so|hmm)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const generateSummary = (text) => {
    if (!text || text.length < 20) return "";

    const cleanedText = cleanTranscript(text);
    const lower = cleanedText.toLowerCase();

    const nameMatch =
      cleanedText.match(/my name is ([a-zA-Z]+)/i) ||
      cleanedText.match(/i am ([a-zA-Z]+)/i);

    const rawName = nameMatch ? nameMatch[1] : "the speaker";
    const name =
      rawName === "the speaker"
        ? rawName
        : rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

    let summaryText = "";

    if (lower.includes("hello") || lower.includes("good morning") || lower.includes("welcome")) {
      summaryText += `${name} greets the audience and welcomes everyone. `;
    }

    if (nameMatch) {
      summaryText += `${name} introduces himself at the beginning of the meeting. `;
    }

    if (lower.includes("meeting") || lower.includes("begin") || lower.includes("start")) {
      summaryText += "The meeting begins with an introduction and instructions. ";
    }

    if (lower.includes("project") || lower.includes("discuss")) {
      summaryText += "The discussion focuses on the project and key topics. ";
    }

    console.log("TRANSCRIPT:", text);
    console.log("SUMMARY:", summaryText);

    return summaryText.trim();
  };

  const processTranscript = (transcript) => {
    const summaryText = generateSummary(transcript);
    // Keep last meaningful summary visible; do not clear the box.
    if (summaryText && summaryText.trim().length > 0) {
      setSummary(summaryText);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (transcriptionText && transcriptionText.length > 30) {
        processTranscript(transcriptionText);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [transcriptionText]);

  const effectiveMainUrl = (localVideoUrl || meetingVideoUrl || "").trim();
  const hasMain = Boolean(effectiveMainUrl);
  const hasAvatar = Boolean(avatarVideoUrl?.trim());
  useEffect(() => {
    const timer = setTimeout(() => {
      const words = transcriptionText
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      const latest = words.slice(-5).join(" ").trim();
      if (!latest || latest === lastChunkRef.current) return;
      lastChunkRef.current = latest;
      setSentenceChunk(latest);
    }, 800);
    return () => clearTimeout(timer);
  }, [transcriptionText]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleMainVideoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("video/")) return;

    setLocalVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    onMeetingVideoFile?.(file);
  };

  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      setIsVideoPaused(videoRef.current.paused);
    }
  };

  const uploadZoneClass =
    "relative flex w-full h-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#2a2545] " +
    "rounded-2xl bg-[#16132a]/50 px-6 py-10 text-center transition-all duration-300 " +
    "hover:border-[#6D5FD5]/60 hover:bg-[#6D5FD5]/5 group";

  return (
    <div className={`w-full min-h-full font-['Segoe_UI',system-ui,sans-serif] ${className}`}>
      {!externallyControlled && (
        <input ref={fileInputRef} type="file" accept="video/*" className="sr-only" tabIndex={-1} onChange={handleMainVideoChange} />
      )}

      {/* Modern Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-full">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 h-full">
          
          {/* Video Player Card */}
          <div className="bg-[#13111c]/80 backdrop-blur-xl rounded-3xl border border-[#2a2545] overflow-hidden shadow-2xl relative group/card flex flex-col h-[320px]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2a2545]/60 bg-gradient-to-r from-[#16132a] to-transparent flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6D5FD5]/20 border border-[#6D5FD5]/40 flex items-center justify-center">
                  <span className="text-sm">🎬</span>
                </div>
                <h2 className="text-base font-bold text-white tracking-wide">Video Source</h2>
              </div>
              {hasMain && !externallyControlled && (
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="text-xs font-bold text-[#6D5FD5] hover:text-[#26c6b9] transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Replace
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 relative p-3">
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0F1117] border border-[#2a2545]/40 shadow-inner group-hover/card:border-[#6D5FD5]/30 transition-colors">
                {hasMain ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover scale-100"
                    controls
                    playsInline
                    muted={externallyControlled}
                    autoPlay={externallyControlled}
                    onPlay={handleVideoPlayPause}
                    onPause={handleVideoPlayPause}
                    src={effectiveMainUrl}
                  >
                    <track kind="captions" />
                  </video>
                ) : externallyControlled ? (
                  <div className="flex h-full items-center justify-center text-[#5e5a80] text-sm font-medium">
                    No meeting video loaded.
                  </div>
                ) : (
                  <button
                    type="button"
                    className={uploadZoneClass}
                    onClick={openFilePicker}
                  >
                    <div className="mb-4 h-14 w-14 rounded-full bg-[#6D5FD5] flex items-center justify-center shadow-[0_0_20px_rgba(109,95,213,0.3)] group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <p className="text-base font-bold text-[#e8e4ff]">Upload Video</p>
                    <p className="mt-1 text-xs text-[#9d99c0]">Click to select from device</p>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-[#13111c]/80 backdrop-blur-xl rounded-3xl border border-[#2a2545] shadow-2xl relative flex-1 min-h-[220px]">
            <div className="px-5 py-4 border-b border-[#2a2545]/60 bg-gradient-to-r from-[#16132a] to-transparent flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#26c6b9]/20 border border-[#26c6b9]/40 flex items-center justify-center">
                <span className="text-sm">📝</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">Executive Summary</h2>
            </div>
            <div className="p-5">
              <p className="text-[15px] text-[#9d99c0] leading-relaxed italic">
                {summary}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 h-full">
          
          {/* AI Transcriber Card */}
          <div className="bg-[#13111c]/80 backdrop-blur-xl rounded-3xl border border-[#2a2545] shadow-2xl relative overflow-hidden h-[320px]">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D5FD5]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="px-5 py-4 border-b border-[#2a2545]/60 bg-gradient-to-r from-[#16132a] to-transparent flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D5FD5] to-[#26c6b9] p-[1px]">
                  <div className="w-full h-full bg-[#13111c] rounded-md flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                </div>
                <h2 className="text-base font-bold text-white tracking-wide">Live AI Transcriber</h2>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-[#26c6b9]/30 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#26c6b9] animate-pulse"></span>
                <span className="text-[9px] font-bold text-[#26c6b9] uppercase tracking-wider">Processing</span>
              </div>
            </div>
            
            <div className="p-6 relative z-10">
              <p className="text-[15px] font-medium text-white mb-6">
                AI avatar transcribing audio from video in real-time.
              </p>

              <div className="mb-6">
                <AvatarCanvas sentenceChunk={sentenceChunk} isPaused={isVideoPaused} />
              </div>
              
              <div className="space-y-4">
                {[
                  { text: "Listening to audio stream...", active: true },
                  { text: "Processing speech patterns...", active: true },
                  { text: "Generating transcript...", active: true },
                  { text: "Analyzing content...", active: false }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-4 h-4">
                      {item.active ? (
                        <>
                          <div className="absolute inset-0 rounded-full bg-[#6D5FD5] animate-ping opacity-20"></div>
                          <div className="w-2 h-2 rounded-full bg-[#6D5FD5]"></div>
                        </>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#2a2545]"></div>
                      )}
                    </div>
                    <span className={`text-sm ${item.active ? 'text-[#e8e4ff]' : 'text-[#5e5a80]'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tab Box - Mind Map / Emotion / Speaker */}
          <div className="bg-[#13111c]/80 backdrop-blur-xl rounded-3xl border border-[#2a2545] shadow-2xl flex-1 min-h-[220px] flex flex-col relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#26c6b9]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="p-4 border-b border-[#2a2545]/60 z-10">
              <FeatureTabs 
                activeFeature={activeFeature} 
                onSelect={setActiveFeature} 
              />
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative z-10">
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                {activeFeature === "mindmap" && (
                  <div className="animate-[fadeIn_0.3s_ease-out] w-full">
                    <MindMap data={mindmapData} />
                  </div>
                )}
                {activeFeature === "emotion" && (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#ff7a6e]/20 to-transparent rounded-2xl border border-[#ff7a6e]/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,122,110,0.1)]">
                      😊
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Emotion Detection</h3>
                    <p className="text-[13px] text-[#9d99c0] leading-relaxed">
                      Emotional analysis of speakers and sentiment tracking will appear here. Advanced AI algorithms will detect emotional states and engagement levels.
                    </p>
                  </div>
                )}
                {activeFeature === "speaker" && (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#26c6b9]/20 to-transparent rounded-2xl border border-[#26c6b9]/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(38,198,185,0.1)]">
                      🎤
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Speaker Identity</h3>
                    <p className="text-[13px] text-[#9d99c0] leading-relaxed">
                      Speaker identification and talk time analysis will appear here. The system will track participation and provide detailed analytics.
                    </p>
                  </div>
                )}
              </div>
              
              {/* PDF Button */}
              <div className="flex justify-end mt-4 pt-4 border-t border-[#2a2545]/40">
                <button
                  type="button"
                  onClick={onExportPDF}
                  className="px-5 py-2.5 rounded-xl font-bold text-white text-[13px] bg-gradient-to-r from-[#6D5FD5] to-[#5e50cb] hover:opacity-90 transition-opacity border border-[#6D5FD5] shadow-[0_0_15px_rgba(109,95,213,0.3)] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
