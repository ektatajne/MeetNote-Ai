export default function ResultTabs({ activeTab, setActiveTab }) {
  const tab = (id, label, icon) => {
    const active = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex-1 py-3 px-4 flex items-center justify-center font-semibold transition border-r border-meet-line last:border-r-0
          ${active ? "bg-meet-purple text-meet-text rounded-lg shadow-meet-sm m-0.5 border border-[rgba(109,95,213,0.3)]" : "text-meet-muted bg-transparent hover:bg-meet-input/60"}`}
      >
        <span className="mr-2">{icon}</span> {label}
      </button>
    );
  };

  return (
    <div className="flex w-full rounded-lg overflow-hidden border border-meet-line bg-meet-card mt-8 max-w-3xl mx-auto shadow-meet-sm">
      {tab("transcript", "Transcript", "📝")}
      {tab("summary", "Summary", "📋")}
      {tab("mindmap", "Mind Map", "🗺️")}
    </div>
  );
}
