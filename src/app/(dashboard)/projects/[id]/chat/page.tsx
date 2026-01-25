"use client";

import { use } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: projectId } = use(params);

  return (
    <div className="h-full">
      <ChatInterface projectId={projectId} />
    </div>
  );
}
