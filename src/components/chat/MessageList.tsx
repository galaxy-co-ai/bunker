// BUNKER Message List
// Scrollable message history display

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../lib/types/claude';
import { ChatBubble } from './ChatBubble';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-text-muted">
        <div className="text-center">
          <div className="text-2xl mb-2">📡</div>
          <p className="text-sm">Awaiting transmission...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ChatBubble message={message} />
        </motion.div>
      ))}
    </div>
  );
}
