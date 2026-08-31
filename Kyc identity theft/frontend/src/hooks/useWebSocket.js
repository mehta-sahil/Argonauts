import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (sessionId, onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const connect = useCallback(() => {
    if (!sessionId) return;
    
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Derive the WebSocket URL from where the page is served.
    // - In production the app is served over HTTPS behind CloudFront/ALB on the
    //   same origin as the API, so use wss:// with no explicit port (an HTTPS
    //   page cannot open an insecure ws:// socket — the browser blocks it).
    // - In Vite dev the page is on :5173 while the backend is on :8000, so fall
    //   back to that port. Override with VITE_WS_URL for any other setup.
    let wsUrl;
    if (import.meta.env.VITE_WS_URL) {
      wsUrl = `${import.meta.env.VITE_WS_URL.replace(/\/$/, "")}/ws/${sessionId}`;
    } else {
      const isSecure = window.location.protocol === "https:";
      const proto = isSecure ? "wss" : "ws";
      const host = window.location.hostname || "localhost";
      // Same-origin behind a proxy: reuse the page's port (empty for 443/80).
      // Dev over plain http on any host: target the backend on :8000.
      const port = isSecure ? (window.location.port ? `:${window.location.port}` : "") : ":8000";
      wsUrl = `${proto}://${host}${port}/ws/${sessionId}`;
    }

    console.log(`[WebSocket] Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[WebSocket] Connection established.");
      setIsConnected(true);
      setConnectionError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      } catch (err) {
        console.error("[WebSocket] Parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WebSocket] Connection error:", err);
      setConnectionError("Failed to connect to backend server");
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] Disconnected code=${event.code}`);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [sessionId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage
  };
};
