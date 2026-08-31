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

    // Connect same-origin. In dev, Vite proxies /ws to the backend (see
    // vite.config.js); in production CloudFront routes /ws/* to the ALB. Using
    // the page's own host+port keeps wss:// on an HTTPS page (a secure page
    // cannot open an insecure ws:// socket). VITE_WS_URL overrides for setups
    // where the backend lives on a different origin.
    let wsUrl;
    if (import.meta.env.VITE_WS_URL) {
      wsUrl = `${import.meta.env.VITE_WS_URL.replace(/\/$/, "")}/ws/${sessionId}`;
    } else {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      wsUrl = `${proto}://${window.location.host}/ws/${sessionId}`;
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
