import { useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function InputArea({ value, onChange, onSend, disabled, indexReady }) {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    const t = textareaRef.current;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 140) + "px";
  };

  useEffect(() => {
    if (!value && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={indexReady ? "Ask something about the manual…" : "Please select a vehicle first"}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={!indexReady}
        />
        <button
          className="send-btn"
          onClick={onSend}
          disabled={!value.trim() || disabled || !indexReady}
        >
          <ArrowUp size={18} />
        </button>
      </div>
      <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
    </div>
  );
}
