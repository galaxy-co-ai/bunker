// BUNKER Settings Panel
// Modal for app configuration

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../lib/store';
import { ApiKeyManager } from './ApiKeyManager';

export function SettingsPanel() {
  const { settingsOpen, closeSettings, refreshApiKeyStatuses } = useSettingsStore();

  // Refresh statuses when opening
  useEffect(() => {
    if (settingsOpen) {
      refreshApiKeyStatuses();
    }
  }, [settingsOpen, refreshApiKeyStatuses]);

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSettings}
            className="fixed inset-0 bg-black/70 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-[10%] lg:inset-[15%] bg-concrete-dark border-2 border-vault-yellow/50 rounded-lg z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-vault-brown/30">
              <div className="flex items-center gap-2">
                <span className="text-vault-yellow text-xl">⚙</span>
                <h2 className="terminal-text text-vault-yellow text-lg">
                  BUNKER SETTINGS
                </h2>
              </div>

              <button
                onClick={closeSettings}
                className="text-text-muted hover:text-vault-yellow text-xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* API Keys Section */}
                <section>
                  <h3 className="text-vault-yellow text-sm font-terminal mb-3 flex items-center gap-2">
                    <span>🔑</span>
                    API KEYS
                  </h3>
                  <p className="text-text-muted text-sm mb-4">
                    Configure API keys for cloud services. Keys are stored securely
                    in your system's keyring.
                  </p>
                  <ApiKeyManager />
                </section>

                {/* Info Section */}
                <section className="border-t border-vault-brown/30 pt-6">
                  <h3 className="text-vault-yellow text-sm font-terminal mb-3 flex items-center gap-2">
                    <span>ℹ</span>
                    ABOUT BUNKER
                  </h3>
                  <div className="text-text-muted text-sm space-y-2">
                    <p>
                      <span className="text-text-secondary">Version:</span> 1.0.0
                    </p>
                    <p>
                      <span className="text-text-secondary">Vault:</span> VAULT-7
                    </p>
                    <p>
                      BUNKER is your AI command center for managing local and cloud
                      AI models, automating workflows, and orchestrating agents.
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-vault-brown/30">
              <button
                onClick={closeSettings}
                className="vault-button"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
