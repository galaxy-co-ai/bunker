// ═══════════════════════════════════════════════════════════════
// BUNKER - Add/Edit Secret Modal
// Modal for creating or editing secrets
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AddEditModalProps {
  editingName: string | null;
  initialValue?: string;
  existingProjects: string[];
  onClose: () => void;
  onSave: (name: string, value: string) => void;
}

export function AddEditModal({
  editingName,
  initialValue,
  existingProjects,
  onClose,
  onSave,
}: AddEditModalProps) {
  const [name, setName] = useState(editingName || '');
  const [value, setValue] = useState(initialValue || '');
  const [showValue, setShowValue] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [customProject, setCustomProject] = useState('');

  const isEditing = !!editingName;

  // Build the final name with project prefix
  const finalName = useMemo(() => {
    if (isEditing) return name;

    const project = customProject || selectedProject;
    if (project && !name.includes(project)) {
      // Insert project into name if using naming convention
      const parts = name.split('_');
      if (parts.length >= 2) {
        // Insert after category: AI_OPENAI_KEY -> AI_OPENAI_BUNKER_KEY
        parts.splice(2, 0, project);
        return parts.join('_');
      }
      return `${project}_${name}`;
    }
    return name;
  }, [name, selectedProject, customProject, isEditing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="vault-panel w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border-warning/50 bg-metal-rust/50">
          <h3 className="heading-text text-sm flex items-center gap-2">
            <span className="text-vault-yellow">{isEditing ? '✏️' : '➕'}</span>
            {isEditing ? 'EDIT SECRET' : 'ADD NEW SECRET'}
          </h3>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Project Selector (only for new secrets) */}
          {!isEditing && existingProjects.length > 0 && (
            <div>
              <span id="project-selector-label" className="block text-text-muted text-xs mb-1 heading-text">
                PROJECT (OPTIONAL)
              </span>
              <div className="flex gap-2 flex-wrap mb-2" role="group" aria-labelledby="project-selector-label">
                <button
                  type="button"
                  onClick={() => { setSelectedProject(''); setCustomProject(''); }}
                  aria-pressed={!selectedProject && !customProject}
                  className={`px-2 py-1 text-[10px] font-mono border transition-all ${
                    !selectedProject && !customProject
                      ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
                      : 'border-border-warning/30 text-text-muted hover:border-vault-yellow/50'
                  }`}
                >
                  NONE
                </button>
                {existingProjects.map(proj => (
                  <button
                    key={proj}
                    type="button"
                    onClick={() => { setSelectedProject(proj); setCustomProject(''); }}
                    aria-pressed={selectedProject === proj}
                    className={`px-2 py-1 text-[10px] font-mono border transition-all ${
                      selectedProject === proj
                        ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
                        : 'border-border-warning/30 text-text-muted hover:border-vault-yellow/50'
                    }`}
                  >
                    {proj}
                  </button>
                ))}
              </div>
              <label htmlFor="custom-project-input" className="sr-only">Custom project name</label>
              <input
                id="custom-project-input"
                type="text"
                value={customProject}
                onChange={e => { setCustomProject(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setSelectedProject(''); }}
                placeholder="Or type new project name..."
                className="w-full bg-concrete-dark border-2 border-border-warning/50 px-3 py-1.5 text-terminal-amber font-mono text-xs focus:border-vault-yellow focus:outline-none"
              />
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="secret-name-input" className="block text-text-muted text-xs mb-1 heading-text">
              SECRET NAME
            </label>
            <input
              id="secret-name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
              disabled={isEditing}
              placeholder="e.g., AI_OPENAI_KEY"
              aria-describedby="secret-name-hint"
              className="w-full bg-concrete-dark border-2 border-border-warning/50 px-3 py-2 text-terminal-amber font-mono text-sm focus:border-vault-yellow focus:outline-none disabled:opacity-50"
            />
            {!isEditing && finalName !== name && (
              <div className="text-safe text-[10px] mt-1">
                Will be saved as: <span className="font-mono">{finalName}</span>
              </div>
            )}
            <div id="secret-name-hint" className="text-text-muted text-[10px] mt-1">
              Convention: CATEGORY_SERVICE_PROJECT_KEY (e.g., AI_OPENAI_BUNKER_KEY)
            </div>
          </div>

          {/* Value Field */}
          <div>
            <label htmlFor="secret-value-input" className="block text-text-muted text-xs mb-1 heading-text">
              SECRET VALUE
            </label>
            <div className="relative">
              <input
                id="secret-value-input"
                type={showValue ? 'text' : 'password'}
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter secret value..."
                className="w-full bg-concrete-dark border-2 border-border-warning/50 px-3 py-2 pr-10 text-terminal-green font-mono text-sm focus:border-vault-yellow focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                aria-label={showValue ? 'Hide secret value' : 'Show secret value'}
                aria-pressed={showValue}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-vault-yellow"
              >
                {showValue ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onSave(finalName, value)}
              disabled={!finalName || !value}
              aria-label={isEditing ? 'Update secret' : 'Save new secret'}
              className="vault-button flex-1 disabled:opacity-50"
            >
              {isEditing ? 'UPDATE' : 'SAVE'} SECRET
            </button>
            <button
              onClick={onClose}
              aria-label="Cancel and close modal"
              className="vault-button vault-button-danger"
            >
              CANCEL
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
