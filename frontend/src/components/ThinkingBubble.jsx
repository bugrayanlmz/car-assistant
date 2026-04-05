import { Sparkles } from "lucide-react";

export default function ThinkingBubble() {
  return (
    <div className="message ai">
      <div className="message-meta">
        <span>AutoHelper</span>
      </div>
      <div className="bubble">
        <div className="thinking">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    </div>
  );
}
