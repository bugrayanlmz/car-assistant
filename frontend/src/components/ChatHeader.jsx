import { Wifi, WifiOff, Loader2 } from "lucide-react";

export default function ChatHeader({ serverActive, serverLoading, activeVehicle }) {
  const title = activeVehicle ? activeVehicle.name : "Vehicle Assistant";

  return (
    <div className="chat-header">
      <div className="chat-title">{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {serverLoading ? (
          <span className="model-badge" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Connecting…
          </span>
        ) : serverActive ? (
          <span className="model-badge" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Wifi size={12} /> Gemini 2.5 Flash
          </span>
        ) : (
          <span className="model-badge" style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--danger)" }}>
            <WifiOff size={12} /> Disconnected
          </span>
        )}
      </div>
    </div>
  );
}
