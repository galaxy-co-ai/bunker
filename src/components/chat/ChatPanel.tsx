// BUNKER Chat Panel
// Main container for Claude conversations

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../lib/store';
import { useSettingsStore } from '../../lib/store';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { ModelSelector } from './ModelSelector';

export function ChatPanel() {
  const {
    conversations,
    activeConversationId,
    isStreaming,
    selectedModel,
    error,
    createConversation,
    setActiveConversation,
    deleteConversation,
    clearError,
  } = useChatStore();

  const { openSettings, apiKeyStatuses } = useSettingsStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const hasClaudeKey = apiKeyStatuses.find(
    (k) => k.name === 'ANTHROPIC_API_KEY'
  )?.isSet;

  // Load API key status on mount
  useEffect(() => {
    useSettingsStore.getState().refreshApiKeyStatuses();
  }, []);

  return (
    <div className="h-full flex flex-col bg-concrete-medium border border-vault-brown/30 rounded overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-vault-brown/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-vault-yellow text-lg">⚛</span>
            <h2 className="terminal-text text-vault-yellow text-sm">
              CLAUDE INTERFACE
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector />

            <button
              onClick={createConversation}
              className="px-2 py-1 text-xs border border-vault-brown/30 text-text-muted hover:text-vault-yellow hover:border-vault-yellow transition-colors"
            >
              + NEW
            </button>
          </div>
        </div>

        {/* Conversation tabs */}
        {conversations.length > 0 && (
          <div className="flex gap-1 mt-2 overflow-x-auto">
            {conversations.slice(0, 5).map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`flex items-center gap-1 px-2 py-1 text-xs border transition-colors whitespace-nowrap ${
                  activeConversationId === conv.id
                    ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
                    : 'border-vault-brown/30 text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="max-w-[100px] truncate">{conv.title}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="hover:text-danger ml-1"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasClaudeKey ? (
          // No API key configured
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-vault-yellow text-lg mb-2">
                API KEY REQUIRED
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Configure your Anthropic API key to use Claude
              </p>
              <button
                onClick={openSettings}
                className="vault-button"
              >
                OPEN SETTINGS
              </button>
            </div>
          </div>
        ) : !activeConversation ? (
          // No active conversation
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-vault-yellow text-lg mb-2">
                START A CONVERSATION
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Begin chatting with Claude using {selectedModel}
              </p>
              <button
                onClick={createConversation}
                className="vault-button"
              >
                NEW CHAT
              </button>
            </div>
          </div>
        ) : (
          // Active conversation
          <>
            <MessageList messages={activeConversation.messages} />
            <ChatInput disabled={isStreaming} />
          </>
        )}

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-4 right-4 bg-danger/20 border border-danger text-danger text-sm p-3 rounded"
            >
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="hover:text-white">
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      {activeConversation && (
        <div className="flex-shrink-0 border-t border-vault-brown/30 px-3 py-1 flex items-center justify-between text-xs text-text-muted">
          <span>
            {activeConversation.messages.length} messages
          </span>
          <span>
            {activeConversation.totalTokens.toLocaleString()} tokens •{' '}
            ${activeConversation.totalCost.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
