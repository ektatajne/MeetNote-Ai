import { useAccessibility } from "../../context/AccessibilityContext";

export default function SummaryPanel({ summary }) {
  const { fontSize } = useAccessibility();

  if (!summary || summary.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto h-48 border border-meet-line bg-meet-card rounded-lg flex items-center justify-center mt-4 shadow-meet-sm">
        <p className="text-meet-muted italic">Summary will appear after processing completes.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 font-sans flex flex-col">
      <div className="p-8 rounded-lg border border-meet-line bg-meet-card text-meet-text shadow-meet-sm">
        <ul className="space-y-4">
          {summary.map((point, index) => (
            <li key={index} className="flex" style={{ fontSize: `${fontSize + 2}px` }}>
              <span className="shrink-0 mr-4 font-bold text-meet-purpleLight">→</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="px-6 py-2 border border-meet-line rounded-lg text-sm font-semibold text-meet-muted hover:text-meet-text hover:bg-meet-input transition bg-transparent"
        >
          Copy Summary
        </button>
      </div>
    </div>
  );
}
