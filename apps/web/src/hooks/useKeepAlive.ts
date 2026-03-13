import { useEffect, useRef } from "react";

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes

export function useKeepAlive(healthUrl: string) {
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const ping = () => {
      fetch(healthUrl, { method: "GET" }).catch(() => {
        // Ignore errors — this is best-effort.
      });
    };

    // Initial ping to warm up the backend.
    ping();

    intervalRef.current = window.setInterval(ping, PING_INTERVAL);
    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [healthUrl]);
}
