"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface TelegramMessage {
  id: string;
  role: "assistant";
  content: string;
  createdAt: string;
}

interface SSEEvent {
  type: "connected" | "message" | "heartbeat";
  conversationId?: string;
  message?: TelegramMessage;
  timestamp?: number;
}

interface UseTelegramEventsOptions {
  onMessage?: (message: TelegramMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface UseTelegramEventsReturn {
  isConnected: boolean;
  isReconnecting: boolean;
  messages: TelegramMessage[];
  error: Error | null;
  reconnect: () => void;
  clearMessages: () => void;
}

/**
 * Hook for subscribing to real-time Telegram message updates via SSE
 */
export function useTelegramEvents(
  conversationId: string | null,
  enabled: boolean = true,
  options: UseTelegramEventsOptions = {}
): UseTelegramEventsReturn {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!conversationId || !enabled) {
      return;
    }

    // Close existing connection
    disconnect();

    setIsReconnecting(reconnectAttemptsRef.current > 0);
    setError(null);

    try {
      const eventSource = new EventSource(
        `/api/telegram/events?conversationId=${encodeURIComponent(conversationId)}`
      );

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("SSE connected for conversation:", data.conversationId);
              break;

            case "message":
              if (data.message) {
                setMessages((prev) => [...prev, data.message!]);
                onMessage?.(data.message);
              }
              break;

            case "heartbeat":
              // Connection is alive, nothing to do
              break;
          }
        } catch (parseError) {
          console.error("Failed to parse SSE message:", parseError);
        }
      };

      eventSource.onerror = (event) => {
        console.error("SSE error:", event);
        setIsConnected(false);

        const err = new Error("SSE connection error");
        setError(err);
        onError?.(err);
        onDisconnect?.();

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setIsReconnecting(true);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        } else {
          setIsReconnecting(false);
          console.error("Max reconnection attempts reached");
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to connect");
      setError(error);
      onError?.(error);
    }
  }, [
    conversationId,
    enabled,
    disconnect,
    onConnect,
    onDisconnect,
    onMessage,
    onError,
    reconnectDelay,
    maxReconnectAttempts,
  ]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connect/disconnect based on enabled state and conversationId
  useEffect(() => {
    if (enabled && conversationId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, enabled, connect, disconnect]);

  return {
    isConnected,
    isReconnecting,
    messages,
    error,
    reconnect,
    clearMessages,
  };
}
