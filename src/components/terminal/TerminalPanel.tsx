// BUNKER Terminal Panel
// Container for terminal tabs and views

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalStore } from '../../lib/store';
import { TerminalTab } from './TerminalTab';
import { TerminalView } from './TerminalView';

export function TerminalPanel() {
  const {
    sessions,
    activeSessionId,
    error,
    createSession,
    closeSession,
    setActiveSession,
    clearError,
  } = useTerminalStore();

  // Create initial session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      createSession('Terminal 1');
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-concrete-medium border border-vault-brown/30 rounded overflow-hidden">
      {/* Header with tabs */}
      <div className="flex-shrink-0 border-b border-vault-brown/30">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <span className="text-pip-green text-lg">▶</span>
            <h2 className="terminal-text text-pip-green text-sm">
              TERMINAL
            </h2>
          </div>

          <button
            onClick={() => createSession()}
            className="px-2 py-1 text-xs border border-vault-brown/30 text-text-muted hover:text-pip-green hover:border-pip-green transition-colors"
          >
            + NEW
          </button>
        </div>

        {/* Tabs */}
        {sessions.length > 0 && (
          <div className="flex gap-1 px-2 pb-2 overflow-x-auto">
            {sessions.map((session) => (
              <TerminalTab
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => setActiveSession(session.id)}
                onClose={() => closeSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Terminal content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeSessionId ? (
            <motion.div
              key={activeSessionId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <TerminalView sessionId={activeSessionId} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-pip-green text-lg mb-2">
                  NO ACTIVE TERMINAL
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  Create a new terminal session to get started
                </p>
                <button
                  onClick={() => createSession()}
                  className="vault-button"
                >
                  NEW TERMINAL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CRT scanline overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-10" />
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-danger/20 border border-danger text-danger text-sm p-3 rounded"
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

      {/* Status bar */}
      <div className="flex-shrink-0 border-t border-vault-brown/30 px-3 py-1 flex items-center justify-between text-xs text-text-muted">
        <span>{sessions.length} session(s)</span>
        <span className="text-pip-green">● READY</span>
      </div>
    </div>
  );
}
