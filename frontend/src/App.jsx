import { useState, useRef, useEffect } from "react";
import { useRagAssistant } from "./hooks/useRagAssistant";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import Message from "./components/Message";
import ThinkingBubble from "./components/ThinkingBubble";
import InputArea from "./components/InputArea";
import EmptyState from "./components/EmptyState";
import ConfirmModal from "./components/ConfirmModal";

export default function App() {
  const [inputVal, setInputVal] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    messages,
    loading,
    vehicles,
    activeVehicle,
    vehicleLoading,
    serverActive,
    serverLoading,
    selectVehicle,
    askQuestion,
    indexReady,
  } = useRagAssistant();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputVal.trim() || loading || !indexReady) return;
    askQuestion(inputVal);
    setInputVal("");
  };

  const handleSuggestion = (text) => {
    if (!indexReady) return;
    askQuestion(text);
  };

  return (
    <div className="app">
      <Sidebar
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        vehicleLoading={vehicleLoading}
        onSelectVehicle={selectVehicle}
      />

      <main className="chat-area">
        <ChatHeader
          serverActive={serverActive}
          serverLoading={serverLoading}
          activeVehicle={activeVehicle}
        />

        <div className="messages">
          {messages.length === 0 && (
            <EmptyState indexReady={indexReady} onSuggestion={handleSuggestion} />
          )}
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}
          {loading && <ThinkingBubble />}
          <div ref={messagesEndRef} />
        </div>

        <InputArea
          value={inputVal}
          onChange={setInputVal}
          onSend={handleSend}
          disabled={loading}
          indexReady={indexReady}
        />
      </main>

      <ConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={() => {}}
      />
    </div>
  );
}