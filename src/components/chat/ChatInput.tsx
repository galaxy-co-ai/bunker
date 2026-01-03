// BUNKER Chat Input
// Message input with send button

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../lib/store';

interface ChatInputProps {
  disabled?: boolean;
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming } = useChatStore();

  const handleSubmit = () => {
    if (!input.trim() || disabled || isStreaming) return;

    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  return (
    <div className="flex-shrink-0 border-t border-vault-brown/30 p-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? 'Claude is responding...'
                : 'Enter your message... (Shift+Enter for new line)'
            }
            disabled={disabled || isStreaming}
            rows={1}
            className="w-full bg-concrete-dark border border-vault-brown/30 rounded px-3 py-2 text-sm text-text-secondary font-terminal resize-none focus:border-vault-yellow focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-2 bottom-2 text-xs text-text-muted">
            {input.length}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled || isStreaming}
          className="vault-button self-end disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming ? (
            <span className="flex items-center gap-1">
              <span className="animate-pulse">●</span> SENDING
            </span>
          ) : (
            'TRANSMIT'
          )}
        </button>
      </div>
    </div>
  );
}
