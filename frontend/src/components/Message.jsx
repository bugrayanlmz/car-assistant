import { Sparkles, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`message ${isUser ? "user" : "ai"}`}>
      <div className="message-meta">
        {isUser ? (
          <><span>You</span><span>·</span><span>{msg.time}</span></>
        ) : (
          <><span>AutoHelper</span><span>·</span><span>{msg.time}</span></>
        )}
      </div>

      <div className={`bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        <ReactMarkdown>{msg.content}</ReactMarkdown>

        {msg.sources?.length > 0 && (
          <div className="sources">
            {msg.sources.map((src, i) => (
              <span key={i} className="source-chip">
                <FileText size={12} /> {src.file} · p.{src.page}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
