// BUNKER Chat Store
// Zustand state management for Claude conversations

import { create } from 'zustand';
import type { Conversation, Message, StreamChunk } from '../types/claude';
import { claude } from '../services/tauri-bridge';
import { useMetricsStore } from './metrics-store';

// Model cost lookup (per 1k tokens)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  'claude-opus-4-20250514': { input: 0.015, output: 0.075 },
  'claude-3-5-haiku-20241022': { input: 0.001, output: 0.005 },
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model] ?? { input: 0.003, output: 0.015 };
  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;
  return Math.round((inputCost + outputCost) * 1000000) / 1000000; // Round to 6 decimals
}

interface ChatStore {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  selectedModel: string;
  error: string | null;

  // Actions
  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  setModel: (model: string) => void;
  clearError: () => void;

  // Message actions
  sendMessage: (content: string, system?: string) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => void;
  appendToLastMessage: (conversationId: string, content: string) => void;
  updateConversationStats: (
    conversationId: string,
    inputTokens: number,
    outputTokens: number
  ) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  selectedModel: 'claude-sonnet-4-20250514',
  error: null,

  // Create a new conversation
  createConversation: () => {
    const id = crypto.randomUUID();
    const newConversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      model: get().selectedModel,
      createdAt: new Date(),
      totalTokens: 0,
      totalCost: 0,
    };

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      activeConversationId: id,
    }));

    return id;
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
    })),

  setModel: (model) => set({ selectedModel: model }),

  clearError: () => set({ error: null }),

  // Add a message to a conversation
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      ),
    })),

  // Append content to the last message (for streaming)
  appendToLastMessage: (conversationId, content) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;
        const messages = [...conv.messages];
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + content,
          };
        }
        return { ...conv, messages };
      }),
    })),

  // Update token counts and cost
  updateConversationStats: (conversationId, inputTokens, outputTokens) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id !== conversationId) return conv;
        const newTokens = conv.totalTokens + inputTokens + outputTokens;
        const cost = calculateCost(conv.model, inputTokens, outputTokens);
        const newCost = conv.totalCost + cost;
        return { ...conv, totalTokens: newTokens, totalCost: newCost };
      }),
    })),

  // Send a message and stream response
  sendMessage: async (content: string, system?: string) => {
    const state = get();
    let conversationId = state.activeConversationId;

    // Create conversation if none active
    if (!conversationId) {
      conversationId = get().createConversation();
    }

    const conversation = get().conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    // Add user message
    get().addMessage(conversationId, { role: 'user', content });

    // Update title if first message
    if (conversation.messages.length === 0) {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, title: content.slice(0, 50) + (content.length > 50 ? '...' : '') }
            : c
        ),
      }));
    }

    // Add empty assistant message for streaming
    get().addMessage(conversationId, { role: 'assistant', content: '' });

    set({ isStreaming: true, error: null });

    // Track request start time for metrics
    const requestStartTime = Date.now();
    const model = state.selectedModel;

    try {
      // Get all messages for context
      const messages = get()
        .conversations.find((c) => c.id === conversationId)
        ?.messages.slice(0, -1) // Exclude the empty assistant message
        .map((m) => ({ role: m.role, content: m.content })) ?? [];

      // Stream response
      const unlisten = await claude.streamMessage(
        conversationId!,
        messages,
        model,
        (chunk: StreamChunk) => {
          if (chunk.chunk_type === 'text' && chunk.content) {
            get().appendToLastMessage(conversationId!, chunk.content);
          } else if (chunk.chunk_type === 'done' && chunk.usage) {
            const responseTimeMs = Date.now() - requestStartTime;
            const inputTokens = chunk.usage.input_tokens;
            const outputTokens = chunk.usage.output_tokens;
            const cost = calculateCost(model, inputTokens, outputTokens);

            // Update conversation stats
            get().updateConversationStats(conversationId!, inputTokens, outputTokens);

            // Record metrics
            useMetricsStore.getState().recordApiCall({
              timestamp: Date.now(),
              provider: 'claude',
              model,
              inputTokens,
              outputTokens,
              cost,
              responseTimeMs,
              success: true,
              conversationId: conversationId!,
            });

            set({ isStreaming: false });
            unlisten();
          } else if (chunk.chunk_type === 'error') {
            const responseTimeMs = Date.now() - requestStartTime;

            // Record failed API call
            useMetricsStore.getState().recordApiCall({
              timestamp: Date.now(),
              provider: 'claude',
              model,
              inputTokens: 0,
              outputTokens: 0,
              cost: 0,
              responseTimeMs,
              success: false,
              error: chunk.error ?? 'Unknown error',
              conversationId: conversationId!,
            });

            set({ error: chunk.error ?? 'Unknown error', isStreaming: false });
            unlisten();
          }
        },
        4096,
        system
      );
    } catch (error) {
      const responseTimeMs = Date.now() - requestStartTime;

      // Record failed API call
      useMetricsStore.getState().recordApiCall({
        timestamp: Date.now(),
        provider: 'claude',
        model,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        responseTimeMs,
        success: false,
        error: String(error),
        conversationId: conversationId!,
      });

      set({ error: String(error), isStreaming: false });
    }
  },
}));
