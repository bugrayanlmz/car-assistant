import { useState, useEffect } from "react";
import { API } from "../constants";

export function useServerStatus() {
  const [serverActive, setServerActive] = useState(false);
  const [serverLoading, setServerLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const r = await fetch(`${API}/status`);
        if (r.ok) {
          setServerActive(true);
        }
      } catch {
        setServerActive(false);
      } finally {
        setServerLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return { serverActive, serverLoading };
}
