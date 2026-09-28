import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "../../context/AccessibilityContext";

export default function MeetingHistorySidebar({
  currentMeetingTitle = null,
  activeMeetingId = null,
  onSelectMeeting = () => {},
  historyStorageKey = "meetnote_history",
}) {
  const navigate = useNavigate();
  const { fontSize, setFontSize, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useAccessibility();

  const [meetingHistory, setMeetingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(historyStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // We can optionally refresh from local storage if needed, but it's okay.

  return (
    <aside className="w-[280px] min-h-screen sticky top-0 bg-[#13111c]/80 backdrop-blur-xl border-r border-[#2a2545] flex flex-col shrink-0 relative z-20">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#6D5FD5]/10 to-transparent pointer-events-none"></div>
      
      <div className="p-6 border-b border-[#2a2545]/60 relative z-10">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center text-white">
          MeetNote AI
          <span className="w-2 h-2 rounded-full bg-[#6D5FD5] ml-2 animate-pulse shadow-[0_0_10px_rgba(109,95,213,0.7)]" />
        </h1>
      </div>

      <div className="px-6 pt-6 pb-2">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#6D5FD5]">Meeting History</h2>
        <p className="text-[10px] text-[#5e5a80] mt-1">Recent analyses</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 custom-scrollbar">
        {activeMeetingId === "current" && currentMeetingTitle && (
          <button
            onClick={() => onSelectMeeting("current")}
            className="w-full text-left rounded-xl p-3 border border-[#6D5FD5]/30 bg-gradient-to-r from-[#6D5FD5]/10 to-transparent shadow-[inset_2px_0_0_#6D5FD5] transition-all"
          >
            <p className="text-[13px] font-bold text-white truncate">{currentMeetingTitle}</p>
            <p className="text-[11px] text-[#26c6b9] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#26c6b9] animate-pulse"></span>
              Current Session
            </p>
          </button>
        )}
        
        {meetingHistory.length > 0 ? (
          meetingHistory.map((meeting) => {
            const isActive = meeting.id === activeMeetingId;
            if (isActive && meeting.id === "current") return null;
            
            return (
              <button
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className={`w-full text-left rounded-xl p-3 border transition-all duration-300 group ${
                  isActive
                    ? "border-[#6D5FD5]/30 bg-gradient-to-r from-[#6D5FD5]/10 to-transparent shadow-[inset_2px_0_0_#6D5FD5]"
                    : "border-transparent bg-transparent hover:bg-[#16132a] hover:border-[#2a2545]"
                }`}
              >
                <p className={`text-[13px] font-bold truncate transition-colors ${isActive ? "text-white" : "text-[#9d99c0] group-hover:text-[#e8e4ff]"}`}>
                  {meeting.title}
                </p>
                <p className="text-[11px] text-[#5e5a80] mt-1 truncate">{meeting.date}</p>
              </button>
            );
          })
        ) : (
          activeMeetingId !== "current" && (
            <div className="mx-2 mt-2 rounded-xl border border-dashed border-[#2a2545] bg-[#16132a]/50 p-4 text-center">
              <p className="text-[12px] text-[#9d99c0]">No past meetings.</p>
            </div>
          )
        )}
      </div>

      <div className="px-6 py-4 border-t border-[#2a2545]/40 bg-[#13111c]/30">
        <h2 className="text-[10px] uppercase font-bold text-[#26c6b9] tracking-widest mb-3">
          Quick Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-[#9d99c0] mb-2 block uppercase tracking-widest font-semibold">Font Size</label>
            <div className="flex bg-[#0F1117] rounded-lg p-1 border border-[#2a2545]/80">
              {[14, 16, 20].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-1 rounded-md text-[#5e5a80] transition-all ${
                    fontSize === size ? "bg-[#26c6b9]/20 text-[#26c6b9] font-bold" : "hover:text-[#9d99c0] hover:bg-[#16132a]"
                  } ${size === 14 ? "text-[10px]" : size === 16 ? "text-[12px]" : "text-[14px]"}`}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setHighContrast(!highContrast)}>
            <span className="text-[11px] font-semibold text-[#9d99c0] group-hover:text-white transition-colors">High Contrast</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${highContrast ? 'bg-[#6D5FD5]' : 'bg-[#16132a] border border-[#2a2545]'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${highContrast ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer" onClick={() => setReduceMotion(!reduceMotion)}>
            <span className="text-[11px] font-semibold text-[#9d99c0] group-hover:text-white transition-colors">Reduce Motion</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${reduceMotion ? 'bg-[#6D5FD5]' : 'bg-[#16132a] border border-[#2a2545]'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${reduceMotion ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#2a2545]/60 bg-[#13111c]">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full rounded-xl bg-gradient-to-r from-[#6D5FD5] to-[#5e50cb] hover:opacity-90 shadow-[0_4px_15px_rgba(109,95,213,0.3)] transition-all py-3 text-[13px] font-bold text-white flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> New Analysis
        </button>
      </div>
    </aside>
  );
}
