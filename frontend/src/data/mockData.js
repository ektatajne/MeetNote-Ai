export const mockMindMap = {
  center: "Meeting Transcription",
  nodes: [
    { 
      label: "Main Topics", color: "cyan",
      children: ["Feature updates", "Testing phase", "Client Deadline"]
    },
    { 
      label: "Risks", color: "red",
      children: ["Tight deadlines"]
    },
  ]
};

export const mockSoundAlerts = [
  { icon:"📢", msg:"Raised voice detected",    type:"loud"   },
  { icon:"😂", msg:"Laughter detected",         type:"laugh"  },
  { icon:"🔔", msg:"Notification sound",        type:"notif"  },
  { icon:"👏", msg:"Applause detected",         type:"praise" },
  { icon:"🔕", msg:"Brief silence",             type:"quiet"  },
];

export const mockMeetingVideoAnalysis = {
  meetingVideoUrl: "",
  signLanguageVideoUrl: "",
  summaryText:
    "The team aligned on Q2 deliverables for the accessibility roadmap. Key decisions: prioritize caption accuracy, ship the new dashboard shell by April 20, and schedule a follow-up design review. Risks noted include API rate limits during peak usage; mitigation is to add caching on the transcript endpoint.",
  meetingData: {
    transcript: [],
    speakers: [
      { name: "Alex Rivera", talkTimePercent: 54, talkTimeLabel: "14m 12s" },
      { name: "Jordan Lee", talkTimePercent: 32, talkTimeLabel: "8m 24s" },
      { name: "System", talkTimePercent: 14, talkTimeLabel: "3m 40s" },
    ],
    emotionSegments: [
      { speaker: "Alex Rivera", label: "Calm", value: 45, timeRange: "0:00–3:00" },
      { speaker: "Jordan Lee", label: "Engaged", value: 78, timeRange: "3:00–6:30" },
      { speaker: "Alex Rivera", label: "Neutral", value: 52, timeRange: "6:30–10:00" },
      { speaker: "Jordan Lee", label: "Positive", value: 66, timeRange: "10:00–14:00" },
    ],
  },
};
