import { useCallback, useEffect, useRef, useState } from "react";
import MeetingAnalysisView from "../components/meeting/MeetingAnalysisView";
import MeetingHistorySidebar from "../components/layout/MeetingHistorySidebar";
import { mockMeetingVideoAnalysis } from "../data/mockData";

export default function MeetingVideoPage() {
  const inputRef = useRef(null);
  const [meetingVideoBlobUrl, setMeetingVideoBlobUrl] = useState(null);

  const exportMeetingPDF = () => {
    const { meetingData } = mockMeetingVideoAnalysis;
    
    // Updated summary text matching the fourth image
    const updatedSummary = "The team aligned on Q2 deliverables for the accessibility roadmap. Key decisions: prioritize caption accuracy, ship the new dashboard shell by April 20, and schedule a follow-up design review. Risks noted include API rate limits during peak usage; mitigation is to add caching on the transcript endpoint.";
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Meeting Analysis Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #6D5FD5; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .section { 
            margin-bottom: 30px; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
          }
          .section h2 { 
            color: #6D5FD5; 
            margin-bottom: 15px;
          }
          .speaker-item { 
            margin: 10px 0; 
            padding: 10px; 
            background: #f9f9f9; 
            border-radius: 5px;
          }
          .summary-text { 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 5px; 
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Meeting Analysis Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>📝 Executive Summary</h2>
          <div class="summary-text">
            ${updatedSummary}
          </div>
        </div>

        <div class="section">
          <h2>👥 Speaker Analysis</h2>
          ${meetingData.speakers.map(speaker => `
            <div class="speaker-item">
              <strong>${speaker.name}</strong><br>
              Talk Time: ${speaker.talkTimeLabel} (${speaker.talkTimePercent}%)
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const revokeIfBlob = useCallback((url) => {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    return () => revokeIfBlob(meetingVideoBlobUrl);
  }, [meetingVideoBlobUrl, revokeIfBlob]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("video/")) return;

    setMeetingVideoBlobUrl((prev) => {
      revokeIfBlob(prev);
      return URL.createObjectURL(file);
    });
  };

  if (!meetingVideoBlobUrl) {
    return (
      <div className="flex min-h-screen w-full bg-[#0F1117]">
        <MeetingHistorySidebar historyStorageKey="meetnote_video_history" />
        
        <main className="flex-1 min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden bg-gradient-to-b from-[#0F1117] via-[#121527] to-[#0F1117]">
          {/* Local Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#2a2545] bg-[#16132a] text-[#9d99c0] hover:text-[#e8e4ff] hover:border-[#6D5FD5]/50 transition-all shadow-md"
              title="Back to Dashboard"
            >
              <span className="text-xl leading-none">←</span>
            </button>
          </div>

          {/* Full-page ambient background layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(109,95,213,0.22),transparent_52%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(38,198,185,0.08),transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(109,95,213,0.10),transparent_50%)]" />
          </div>

          <div className="w-full max-w-md bg-[#13111c]/90 backdrop-blur-xl border border-[#2a2545] rounded-3xl p-8 shadow-2xl relative z-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#6D5FD5]/20 border border-[#6D5FD5]/40 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-[0_0_30px_rgba(109,95,213,0.2)]">
              🎬
            </div>
            
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Meeting Video</h1>
            <p className="text-sm text-[#9d99c0] mb-8 max-w-sm">
              Upload a meeting video from your device to begin analysis.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#2a2545] bg-[#16132a]/50 px-6 py-8 transition-all hover:bg-[#6D5FD5]/10 hover:border-[#6D5FD5]/50 cursor-pointer"
            >
              <input ref={inputRef} type="file" accept="video/*" className="sr-only" onChange={handleFile} />
              <div className="h-12 w-12 rounded-full bg-[#6D5FD5] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-[#e8e4ff]">Select meeting video</span>
              <span className="text-xs text-[#5e5a80]">MP4, WebM, or MOV</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0F1117]">
      <MeetingHistorySidebar historyStorageKey="meetnote_video_history" />
      
      <main className="flex-1 h-full relative overflow-y-auto">
        {/* Local Back Button */}
        <div className="sticky top-6 left-6 z-30 px-6 pt-0">
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#2a2545] bg-[#16132a] text-[#9d99c0] hover:text-[#e8e4ff] hover:border-[#6D5FD5]/50 transition-all shadow-md"
            title="Back to Dashboard"
          >
            <span className="text-xl leading-none">←</span>
          </button>
        </div>

        <MeetingAnalysisView
          summaryText={mockMeetingVideoAnalysis.summaryText}
          meetingVideoUrl={meetingVideoBlobUrl}
          meetingVideoExternallyControlled
          signLanguageVideoUrl={mockMeetingVideoAnalysis.signLanguageVideoUrl}
          meetingData={mockMeetingVideoAnalysis.meetingData}
          onExportPDF={() => {
            exportMeetingPDF();
          }}
        />
      </main>
    </div>
  );
}
