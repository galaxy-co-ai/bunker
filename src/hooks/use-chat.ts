"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message, Conversation } from "@/lib/db/schema";

interface UseChatOptions {
  conversationId: string | null;
  projectId: string | null;
}

interface SendMessageParams {
  message: string;
  modelId: string;
  context?: string;
}

export function useChat({ conversationId, projectId }: UseChatOptions) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Fetch conversations for a project
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/projects/${projectId}/conversations`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch messages for a conversation
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!conversationId,
  });

  // Create a new conversation
  const createConversation = useMutation({
    mutationFn: async ({ title, modelId }: { title?: string; modelId?: string }) => {
      if (!projectId) throw new Error("No project selected");
      const response = await fetch(`/api/projects/${projectId}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, modelId }),
      });
      if (!response.ok) throw new Error("Failed to create conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", projectId] });
    },
  });

  // Send a message and handle streaming response
  const sendMessage = useCallback(
    async ({ message, modelId, context }: SendMessageParams): Promise<{ content?: string; pendingResponse?: boolean }> => {
      if (!conversationId) throw new Error("No conversation selected");

      setIsStreaming(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            message,
            modelId,
            context,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Failed to send message");
        }

        // Check if this is a Telegram response (JSON, not stream)
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          // Telegram provider returns JSON immediately
          const data = await response.json();

          // Refresh messages to show the user message
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations", projectId] });

          // Return the response data (includes pendingResponse flag)
          return data;
        }

        // Handle streaming response (non-Telegram)
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE data format from Vercel AI SDK
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              // Text chunk
              try {
                const text = JSON.parse(line.slice(2));
                fullContent += text;
                setStreamingContent(fullContent);
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // Refresh messages after streaming completes
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations", projectId] });

        return { content: fullContent };
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [conversationId, projectId, queryClient]
  );

  return {
    // Conversations
    conversations,
    isLoadingConversations,
    conversationsError,
    createConversation,

    // Messages
    messages,
    isLoadingMessages,
    messagesError,
    refetchMessages,

    // Streaming state
    isStreaming,
    streamingContent,
    sendMessage,
  };
}

// Hook to fetch available models
export function useModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const response = await fetch("/api/models");
      if (!response.ok) throw new Error("Failed to fetch models");
      return response.json();
    },
  });
}
