"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, User, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useChat, useModels } from "@/hooks/use-chat";
import { toast } from "@/lib/toast";
import type { Message } from "@/lib/db/schema";

interface PanelChatProps {
  projectId: string | null;
}

async function fetchProjectContext(projectId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/projects/${projectId}/context`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.context || null;
  } catch {
    return null;
  }
}

export function PanelChat({ projectId }: PanelChatProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: modelsData } = useModels();
  const availableModels = modelsData?.models?.filter((m: { available: boolean }) => m.available) || [];

  const {
    conversations,
    messages: chatMessages,
    isStreaming,
    streamingContent,
    sendMessage,
    createConversation,
  } = useChat({
    conversationId: selectedConversationId,
    projectId,
  });

  // Auto-select first conversation or create one
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
      if (conversations[0].modelId) {
        setSelectedModelId(conversations[0].modelId);
      }
    }
  }, [conversations, selectedConversationId]);

  // Auto-select first available model
  useEffect(() => {
    if (!selectedModelId && availableModels.length > 0) {
      // Prefer clawdbot if available, otherwise first model
      const clawdbot = availableModels.find((m: { id: string }) => m.id.startsWith("clawdbot"));
      setSelectedModelId(clawdbot?.id || availableModels[0].id);
    }
  }, [availableModels, selectedModelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, [message]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isStreaming || !selectedModelId) return;

    setMessage("");

    try {
      let convId = selectedConversationId;

      if (!convId) {
        const result = await createConversation.mutateAsync({
          title: `Chat ${new Date().toLocaleString()}`,
          modelId: selectedModelId,
        });
        convId = result.id;
        setSelectedConversationId(convId);
      }

      const context = projectId ? await fetchProjectContext(projectId) : undefined;
      await sendMessage({
        message: trimmed,
        modelId: selectedModelId,
        context: context || undefined,
      });
    } catch (error) {
      toast.error("Error", error instanceof Error ? error.message : "Failed to send message");
    }
  }, [message, isStreaming, selectedModelId, selectedConversationId, projectId, createConversation, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a project to chat
      </div>
    );
  }

  const messages = chatMessages || [];
  const displayMessages = messages.filter((m: Message) => m.role !== "system");

  return (
    <div className="flex h-full flex-col">
      {/* Header with model selector */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
          <span className="text-xs font-medium">AI Chat</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
              {availableModels.find((m: { id: string }) => m.id === selectedModelId)?.name || "Select model"}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableModels.map((model: { id: string; name: string }) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className="text-xs"
              >
                {model.name}
              </DropdownMenuItem>
            ))}
            {availableModels.length === 0 && (
              <DropdownMenuItem disabled className="text-xs">
                No models available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {displayMessages.length === 0 && !streamingContent ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">
              Ask a question about your project
            </p>
          </div>
        ) : (
          <>
            {displayMessages.map((msg: Message) => (
              <MessageBubble key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} />
            ))}
            {isStreaming && streamingContent && (
              <MessageBubble role="assistant" content={streamingContent} isStreaming />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-2">
        <div className="flex items-end gap-1.5">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedModelId ? "Ask anything..." : "Select a model"}
            disabled={isStreaming || !selectedModelId}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-md border border-input bg-background px-2 py-1.5",
              "text-xs placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "min-h-[28px] max-h-[100px]"
            )}
          />
          <Button
            onClick={handleSend}
            disabled={isStreaming || !message.trim() || !selectedModelId}
            size="icon"
            className="h-7 w-7 shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
      </div>
      <div
        className={cn(
          "rounded-md px-2 py-1 max-w-[85%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <div className="whitespace-pre-wrap text-xs leading-relaxed">{content}</div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-3 ml-0.5 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}
