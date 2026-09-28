import { useAccessibility } from "../../context/AccessibilityContext";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { setActiveProfile, fontSize, setFontSize, highContrast, setHighContrast, reduceMotion, setReduceMotion } =
    useAccessibility();
  const location = useLocation();

  const navItems = [
    { id: "colorblind", route: "/dashboard/colorblind", icon: "👁️", name: "Color Blindness", desc: "High contrast · Safe palette" },
    { id: "dyslexia", route: "/dashboard/dyslexia", icon: "📖", name: "Dyslexia", desc: "Friendly font · Wide spacing" },
    { id: "hearing", route: "/dashboard/hearing", icon: "🧏", name: "Hearing Impaired", desc: "Visual alerts · Transcripts" },
    { id: "adhd", route: "/dashboard/adhd", icon: "🧠", name: "ADHD", desc: "Focus mode · Chunked info" },
  ];

  return (
    <aside className="w-[230px] bg-[#0F1117] border-r border-[#2a2545] h-full flex flex-col shrink-0 z-10 relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-[#6D5FD5] opacity-5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="mb-4">
          <h2 className="text-[10px] uppercase font-bold text-[#6D5FD5] tracking-widest mb-1">
            Accessibility
          </h2>
          <p className="text-[10px] text-[#5e5a80] uppercase tracking-wider">Profiles</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <Link
                key={item.id}
                to={item.route}
                onClick={() => setActiveProfile(item.id)}
                className={`flex items-start p-2.5 rounded-xl transition-all duration-300 group border ${
                  isActive
                    ? "bg-gradient-to-r from-[#6D5FD5]/10 to-transparent border-[#6D5FD5]/30 shadow-[inset_2px_0_0_#6D5FD5]"
                    : "border-transparent hover:bg-[#16132a] hover:border-[#2a2545]/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3 shrink-0 transition-all duration-300 ${isActive ? 'bg-[#13111c] border border-[#6D5FD5]/30 shadow-[0_0_10px_rgba(109,95,213,0.2)]' : 'bg-[#16132a] border border-[#2a2545]/40 group-hover:bg-[#13111c] group-hover:scale-105 group-hover:border-[#6D5FD5]/20'}`}>
                  {item.icon}
                </div>
                <div className="py-0.5">
                  <h3 className={`text-[13px] font-bold leading-tight mb-0.5 transition-colors ${isActive ? "text-white" : "text-[#9d99c0] group-hover:text-[#e8e4ff]"}`}>{item.name}</h3>
                  <p className="text-[10px] text-[#5e5a80] leading-tight group-hover:text-[#9d99c0] transition-colors">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="my-6 flex items-center justify-center">
          <div className="w-8 h-[1px] bg-[#2a2545]"></div>
        </div>

        <div className="mb-4">
          <h2 className="text-[10px] uppercase font-bold text-[#26c6b9] tracking-widest mb-1">
            Quick Settings
          </h2>
          <p className="text-[10px] text-[#5e5a80] uppercase tracking-wider">Preferences</p>
        </div>

        <div className="space-y-5 bg-[#13111c]/60 border border-[#2a2545]/60 rounded-2xl p-3.5 backdrop-blur-sm">
          <div>
            <label className="text-[10px] text-[#9d99c0] mb-2 block uppercase tracking-widest font-semibold">Font Size</label>
            <div className="flex bg-[#0F1117] rounded-lg p-1 border border-[#2a2545]/80 shadow-inner">
              <button
                onClick={() => setFontSize(14)}
                className={`flex-1 py-1.5 rounded-md text-[#5e5a80] transition-all duration-300 ${
                  fontSize === 14 ? "bg-[#26c6b9]/20 text-[#26c6b9] font-bold shadow-sm" : "hover:text-[#9d99c0] hover:bg-[#16132a]"
                } text-[11px]`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize(16)}
                className={`flex-1 py-1.5 rounded-md text-[#5e5a80] transition-all duration-300 ${
                  fontSize === 16 ? "bg-[#26c6b9]/20 text-[#26c6b9] font-bold shadow-sm" : "hover:text-[#9d99c0] hover:bg-[#16132a]"
                } text-[13px]`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize(20)}
                className={`flex-1 py-1.5 rounded-md text-[#5e5a80] transition-all duration-300 ${
                  fontSize === 20 ? "bg-[#26c6b9]/20 text-[#26c6b9] font-bold shadow-sm" : "hover:text-[#9d99c0] hover:bg-[#16132a]"
                } text-[15px]`}
              >
                A
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[12px] font-semibold text-[#9d99c0] group-hover:text-white transition-colors">High Contrast</span>
            <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
            <div className="w-9 h-5 bg-[#16132a] border border-[#2a2545] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#5e5a80] peer-checked:after:bg-white after:rounded-full after:h-[16px] after:w-[16px] after:transition-all peer-checked:bg-[#6D5FD5] peer-checked:border-[#6D5FD5] relative shadow-inner" />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-[12px] font-semibold text-[#9d99c0] group-hover:text-white transition-colors">Reduce Motion</span>
            <input type="checkbox" className="sr-only peer" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
            <div className="w-9 h-5 bg-[#16132a] border border-[#2a2545] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-[#5e5a80] peer-checked:after:bg-white after:rounded-full after:h-[16px] after:w-[16px] after:transition-all peer-checked:bg-[#6D5FD5] peer-checked:border-[#6D5FD5] relative shadow-inner" />
          </label>
        </div>
      </div>
    </aside>
  );
}
