// BUNKER Chat Bubble
// Individual message display with Fallout styling

import { useState } from 'react';
import type { Message } from '../../lib/types/claude';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple code block detection and formatting
  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0] || '';
        const code = lines.slice(1).join('\n');

        return (
          <div key={index} className="my-2">
            {language && (
              <div className="text-xs text-text-muted bg-black/30 px-2 py-1 border-b border-vault-brown/30">
                {language}
              </div>
            )}
            <pre className="bg-black/30 p-3 overflow-x-auto text-sm font-terminal text-pip-green">
              <code>{code || lines.join('\n')}</code>
            </pre>
          </div>
        );
      }

      // Handle inline code
      const inlineParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={index}>
          {inlineParts.map((inline, i) =>
            inline.startsWith('`') && inline.endsWith('`') ? (
              <code
                key={i}
                className="bg-black/30 px-1 py-0.5 text-sm font-terminal text-terminal-amber"
              >
                {inline.slice(1, -1)}
              </code>
            ) : (
              <span key={i} className="whitespace-pre-wrap">
                {inline}
              </span>
            )
          )}
        </span>
      );
    });
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded border ${
          isUser
            ? 'bg-vault-yellow/10 border-vault-yellow/30'
            : 'bg-pip-green/5 border-pip-green/30'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-3 py-1 border-b ${
            isUser ? 'border-vault-yellow/20' : 'border-pip-green/20'
          }`}
        >
          <span
            className={`text-xs font-terminal ${
              isUser ? 'text-vault-yellow' : 'text-pip-green'
            }`}
          >
            {isUser ? 'OPERATOR' : 'CLAUDE'}
          </span>
          <button
            onClick={copyContent}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {copied ? '✓ COPIED' : 'COPY'}
          </button>
        </div>

        {/* Content */}
        <div className="px-3 py-2 text-sm text-text-secondary leading-relaxed">
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  );
}
