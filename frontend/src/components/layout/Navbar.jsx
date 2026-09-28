import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="h-14 bg-meet-bg border-b border-meet-line flex items-center justify-between px-6 z-20 shadow-meet-sm">
      <div className="flex items-center space-x-2">
        <Link
          to="/dashboard"
          className="text-meet-text font-bold text-lg tracking-wide hover:text-meet-purpleLight transition flex items-center"
        >
          MeetNote AI
          <span className="w-2 h-2 rounded-full bg-meet-purple ml-2 animate-pulse shadow-[0_0_10px_rgba(109,95,213,0.7)]" />
        </Link>
      </div>

      <div className="flex items-center space-x-5 text-meet-muted">
        <button type="button" className="hover:text-meet-text transition" aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="hover:text-meet-text transition" aria-label="Settings">
          ⚙️
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-meet-input text-meet-text flex items-center justify-center font-bold text-xs ring-2 ring-[rgba(109,95,213,0.3)] border border-meet-line">
            RU
          </div>
          <Link to="/" className="text-sm font-medium text-meet-muted hover:text-meet-text transition">
            Sign Out
          </Link>
        </div>
      </div>
    </nav>
  );
}
