// BUNKER Model Selector
// Dropdown to select Claude model

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../lib/store';
import { claude } from '../../lib/services/tauri-bridge';
import type { ClaudeModel } from '../../lib/types/claude';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ClaudeModel[]>([]);
  const { selectedModel, setModel } = useChatStore();

  useEffect(() => {
    claude.listModels().then(setModels).catch(console.error);
  }, []);

  const currentModel = models.find((m) => m.id === selectedModel);
  const displayName = currentModel?.name ?? selectedModel.split('-').slice(0, 2).join(' ');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs border border-vault-brown/30 text-text-muted hover:text-vault-yellow hover:border-vault-yellow transition-colors"
      >
        <span className="text-pip-green">◆</span>
        <span>{displayName}</span>
        <span className="text-text-muted">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-1 z-20 bg-concrete-dark border border-vault-brown/50 rounded shadow-lg min-w-[200px]"
            >
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-vault-yellow/10 transition-colors ${
                    selectedModel === model.id
                      ? 'bg-vault-yellow/20 text-vault-yellow'
                      : 'text-text-secondary'
                  }`}
                >
                  <div className="font-terminal">{model.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {(model.context_length / 1000).toFixed(0)}K ctx •{' '}
                    ${model.input_cost_per_1k}/${model.output_cost_per_1k} per 1K
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
