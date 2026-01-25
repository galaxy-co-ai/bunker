"use client";

import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/lib/db/schema";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  streamingContent?: string;
  isStreaming?: boolean;
}

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <div className="whitespace-pre-wrap text-sm">{content}</div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
}

export function ChatMessages({
  messages,
  isLoading,
  streamingContent,
  isStreaming,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("flex gap-3", i % 2 === 1 && "flex-row-reverse")}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className={cn("h-16", i % 2 === 0 ? "w-3/4" : "w-1/2")} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0 && !streamingContent) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm">
            Send a message to begin chatting with the AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={message.content}
            />
          ))}
        {isStreaming && streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
