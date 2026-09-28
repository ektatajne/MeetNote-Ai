export default function Navbar() {
  return (
    <header className="mb-8 bg-meet-card border border-meet-line px-5 py-4 rounded-xl shadow-meet-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold leading-none text-meet-text flex items-center">
              MeetNote AI
              <span className="w-2.5 h-2.5 rounded-full bg-meet-purple ml-2 animate-pulse shadow-[0_0_12px_rgba(109,95,213,0.8)]" />
            </h1>
            <p className="text-xs text-meet-muted uppercase tracking-widest mt-1">AI Transcription</p>
          </div>
        </div>
        <span className="text-sm font-medium text-meet-muted">AI Transcription</span>
      </div>
    </header>
  );
}
