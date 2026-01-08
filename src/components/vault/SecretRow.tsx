// ═══════════════════════════════════════════════════════════════
// BUNKER - Secret Row Component
// Individual secret display with actions
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { ParsedSecret } from './types';

interface SecretRowProps {
  secret: ParsedSecret;
  isRevealed: boolean;
  value?: string;
  index: number;
  onReveal: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const envColors: Record<string, string> = {
  'PROD': 'bg-danger/20 text-danger border-danger/50',
  'DEV': 'bg-safe/20 text-safe border-safe/50',
  'STAGING': 'bg-caution/20 text-caution border-caution/50',
  'TEST': 'bg-vault-blue/20 text-vault-blue border-vault-blue/50',
  'LOCAL': 'bg-text-muted/20 text-text-muted border-text-muted/50',
  'PREVIEW': 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber/50',
};

const maskValue = (val: string) => {
  if (val.length <= 8) return '••••••••';
  return val.substring(0, 4) + '••••••••' + val.substring(val.length - 4);
};

export function SecretRow({
  secret,
  isRevealed,
  value,
  index,
  onReveal,
  onCopy,
  onEdit,
  onDelete,
}: SecretRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="px-3 py-2 flex items-center gap-3 hover:bg-vault-yellow/5 transition-colors group"
    >
      {/* Name & Tags */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="terminal-amber text-xs font-mono truncate">
            {secret.name}
          </span>
          {/* Project Badge */}
          {secret.project && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-vault-yellow/10 text-vault-yellow border border-vault-yellow/30">
              {secret.project}
            </span>
          )}
          {/* Environment Badge */}
          {secret.environment && (
            <span className={`px-1.5 py-0.5 text-[9px] font-mono border ${envColors[secret.environment] || envColors['LOCAL']}`}>
              {secret.environment}
            </span>
          )}
        </div>
        {isRevealed && value ? (
          <div className="terminal-text text-[10px] font-mono truncate mt-0.5">
            {value}
          </div>
        ) : (
          <div className="text-text-muted text-[10px] font-mono mt-0.5">
            {value ? maskValue(value) : '••••••••••••••••'}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" role="group" aria-label={`Actions for ${secret.name}`}>
        <button
          onClick={onReveal}
          className="vault-button vault-button-small px-2"
          aria-label={isRevealed ? `Hide ${secret.name}` : `Reveal ${secret.name}`}
          aria-pressed={isRevealed}
        >
          {isRevealed ? '🙈' : '👁️'}
        </button>
        <button
          onClick={onCopy}
          className="vault-button vault-button-small px-2"
          aria-label={`Copy ${secret.name} to clipboard`}
        >
          📋
        </button>
        <button
          onClick={onEdit}
          className="vault-button vault-button-small px-2"
          aria-label={`Edit ${secret.name}`}
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="vault-button vault-button-small vault-button-danger px-2"
          aria-label={`Delete ${secret.name}`}
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
}
