function formatTime(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function fallbackSegments(text) {
  if (!text) return [];
  return text
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((sentence, index) => {
      const start = index * 2;
      const end = start + 2;
      return { start, end, text: `${sentence}.` };
    });
}

export default function TranscriptPanel({ result }) {
  const fullText = typeof result === "string" ? result : result?.text || result?.transcript || "";
  const segments =
    Array.isArray(result?.segments) && result.segments.length > 0 ? result.segments : fallbackSegments(fullText);

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-meet-line bg-meet-card p-5 shadow-meet-sm">
      <h3 className="mb-3 text-xl font-semibold text-meet-text">Transcript:</h3>

      {segments.length > 0 ? (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-meet-line bg-meet-input">
          {segments.map((segment, index) => (
            <div
              key={`${segment.start}-${segment.end}-${index}`}
              className={`grid grid-cols-[64px_1fr] gap-2 px-3 py-2 ${index % 2 === 1 ? "bg-meet-bg/50" : "bg-meet-input"}`}
            >
              <p className="text-lg font-bold text-meet-purpleLight">{formatTime(segment.start)}</p>
              <p className="text-base text-meet-text/90">{segment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-meet-muted">No timestamped segments returned by backend yet.</p>
      )}
    </section>
  );
}
