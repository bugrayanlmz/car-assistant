import { Car } from "lucide-react";
import { SUGGESTIONS } from "../constants";

export default function EmptyState({ indexReady, onSuggestion }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Car size={48} strokeWidth={1} /></div>
      <div className="empty-title">
        {indexReady ? "Ready to help" : "Select a vehicle"}
      </div>
      <div className="empty-sub">
        {indexReady
          ? "Ask anything about your vehicle's manual."
          : "Choose a vehicle from the garage on the left to get started."}
      </div>

      {indexReady && (
        <div className="suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-card" onClick={() => onSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
