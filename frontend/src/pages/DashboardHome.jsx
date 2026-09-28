import { Link } from "react-router-dom";

const sources = [
  { 
    to: "/dashboard/meeting/video", 
    label: "Video Analysis", 
    desc: "AI sign language & meeting insights",
    icon: "🎬",
    color: "from-[#6D5FD5] to-[#26c6b9]"
  },
  { 
    to: "/dashboard/meeting/audio", 
    label: "Audio Analysis", 
    desc: "Generate transcripts from audio",
    icon: "🎧",
    color: "from-[#26c6b9] to-[#1fa398]"
  },
  { 
    to: "/dashboard/default", 
    label: "Text & Documents", 
    desc: "Upload & summarize text content",
    icon: "📄",
    color: "from-[#ffbd2e] to-[#ff9a44]"
  },
  { 
    to: "/dashboard/meeting/live", 
    label: "Live Meeting", 
    desc: "Join and analyze a live session",
    icon: "🔴",
    color: "from-[#ff5f56] to-[#e63946]"
  },
];

export default function DashboardHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[#0F1117]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#6D5FD5] opacity-10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#26c6b9] opacity-10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="text-center mb-10 max-w-xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6D5FD5]/10 border border-[#6D5FD5]/30 w-max mb-4 backdrop-blur-sm mx-auto">
          <span className="text-[11px] font-bold tracking-widest text-[#e8e4ff] uppercase">Workspace</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
          Choose a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5FD5] to-[#26c6b9]">Source</span>
        </h1>
        <p className="text-[#9d99c0] text-base md:text-lg">
          Pick how you want to open your meeting workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl relative z-10">
        {sources.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group relative flex flex-col items-start p-6 rounded-2xl border border-[#2a2545] bg-[#13111c]/80 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:border-[#6D5FD5]/50"
          >
            {/* Hover gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="w-12 h-12 rounded-xl bg-[#16132a] border border-[#2a2545] flex items-center justify-center text-xl mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300 group-hover:border-[#6D5FD5]/40">
              {item.icon}
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1 tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#e8e4ff] transition-all">
              {item.label}
            </h3>
            
            <p className="text-sm text-[#9d99c0] leading-relaxed mb-6 flex-grow">
              {item.desc}
            </p>
            
            <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-[#6D5FD5] group-hover:text-[#26c6b9] transition-colors uppercase tracking-wider">
              <span>Open</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
