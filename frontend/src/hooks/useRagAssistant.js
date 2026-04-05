import { useState, useEffect } from "react";
import { API } from "../constants";
import { getCurrentTime } from "../utils/helpers";
import { useServerStatus } from "./useServerStatus";

export function useRagAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  const { serverActive, serverLoading } = useServerStatus();


  useEffect(() => {
    if (!serverActive) return;
    const fetchVehicles = async () => {
      try {
        const r = await fetch(`${API}/vehicles`);
        if (r.ok) {
          const d = await r.json();
          setVehicles(d.vehicles || []);
        }
      } catch (e) {
        console.error("Failed to fetch vehicle list:", e);
      }
    };
    fetchVehicles();
  }, [serverActive]);

  const selectVehicle = async (vehicle) => {
    if (activeVehicle?.id === vehicle.id) return;
    setVehicleLoading(true);
    setMessages([]);
    try {
      const r = await fetch(`${API}/select_vehicle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id: vehicle.id }),
      });
      if (r.ok) {
        setActiveVehicle(vehicle);
      }
    } catch (e) {
      console.error("Failed to select vehicle:", e);
    } finally {
      setVehicleLoading(false);
    }
  };

  const askQuestion = async (question) => {
    if (!question.trim() || !activeVehicle) return;

    const newMessage = { id: Date.now(), role: "user", content: question, time: getCurrentTime() };
    const aiMessageId = Date.now() + 1;
    
    
    setMessages((m) => [...m, newMessage]);
    setLoading(true);

    let aiMessageCreated = false;

    try {
      const r = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!r.ok) {
        throw new Error("HTTP " + r.status);
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataStr = line.replace("data:", "").trim();
            if (!dataStr) continue;
            
            if (dataStr === "[DONE]") {
              setLoading(false);
              break;
            }

            if (!aiMessageCreated) {
              aiMessageCreated = true;
              setLoading(false);
              setMessages((m) => [
                ...m, 
                { id: aiMessageId, role: "ai", content: "", sources: [], time: getCurrentTime() }
              ]);
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === "sources") {
                setMessages((m) => m.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, sources: parsed.sources } : msg
                ));
              } else if (parsed.type === "chunk") {
                setMessages((m) => m.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, content: msg.content + parsed.content } : msg
                ));
              } else if (parsed.type === "error") {
                setMessages((m) => m.map((msg) =>
                  msg.id === aiMessageId ? { ...msg, content: msg.content + "\n\nError: " + parsed.content } : msg
                ));
              }
            } catch (err) {
              console.error("Stream parse error:", err, dataStr);
            }
          }
        }
      }
    } catch (e) {
      if (!aiMessageCreated) {
        setMessages((m) => [...m, { id: aiMessageId, role: "ai", content: "(Cannot reach server/Network error)", time: getCurrentTime() }]);
      } else {
        setMessages((m) => m.map((msg) => 
          msg.id === aiMessageId ? { ...msg, content: msg.content + "\n\n(Cannot reach server/Network error)" } : msg
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    vehicles,
    activeVehicle,
    vehicleLoading,
    serverActive,
    serverLoading,
    selectVehicle,
    askQuestion,
    indexReady: !!activeVehicle,
  };
}
