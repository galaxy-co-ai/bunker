"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ModelSelector } from "./model-selector";
import { toast } from "@/lib/toast";

// Fetch context from API instead of importing server-side code
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
import type { Conversation } from "@/lib/db/schema";

interface ChatInterfaceProps {
  projectId: string | null;
}

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [includeContext, setIncludeContext] = useState(true);

  const {
    conversations,
    isLoadingConversations,
    messages,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    sendMessage,
    createConversation,
  } = useChat({
    conversationId: selectedConversationId,
    projectId,
  });

  // Select first conversation when loaded
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
      if (conversations[0].modelId) {
        setSelectedModelId(conversations[0].modelId);
      }
    }
  }, [conversations, selectedConversationId]);

  const handleNewConversation = async () => {
    try {
      const result = await createConversation.mutateAsync({
        title: `Chat ${new Date().toLocaleString()}`,
        modelId: selectedModelId || undefined,
      });
      setSelectedConversationId(result.id);
    } catch (error) {
      toast.error("Error", "Failed to create conversation");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedModelId) {
      toast.error("No model selected", "Please select a model before sending a message");
      return;
    }

    if (!selectedConversationId) {
      // Create a new conversation first
      try {
        const result = await createConversation.mutateAsync({
          title: `Chat ${new Date().toLocaleString()}`,
          modelId: selectedModelId,
        });
        setSelectedConversationId(result.id);

        // Send message after conversation is created
        const context = includeContext && projectId ? await fetchProjectContext(projectId) : undefined;
        await sendMessage({
          message,
          modelId: selectedModelId,
          context: context || undefined,
        });
      } catch (error) {
        toast.error("Error", error instanceof Error ? error.message : "Failed to send message");
      }
      return;
    }

    try {
      const context = includeContext && projectId ? await fetchProjectContext(projectId) : undefined;
      await sendMessage({
        message,
        modelId: selectedModelId,
        context: context || undefined,
      });
    } catch (error) {
      toast.error("Error", error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversationId(conv.id);
    if (conv.modelId) {
      setSelectedModelId(conv.modelId);
    }
  };

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a project to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-4">
          <Button onClick={handleNewConversation} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingConversations ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left",
                    "hover:bg-accent transition-colors",
                    selectedConversationId === conv.id && "bg-accent"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">
                    {conv.title || "Untitled"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ModelSelector
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="rounded border-input"
              />
              Include project context
            </label>
          </div>
        </div>

        {/* Messages */}
        <ChatMessages
          messages={messages || []}
          isLoading={isLoadingMessages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            selectedModelId
              ? "Type a message..."
              : "Select a model to start chatting"
          }
        />
      </div>
    </div>
  );
}
