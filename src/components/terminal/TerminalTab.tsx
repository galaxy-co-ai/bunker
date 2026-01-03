// BUNKER Terminal Tab
// Individual tab button for terminal sessions

import type { TerminalSession } from '../../lib/types/terminal';

interface TerminalTabProps {
  session: TerminalSession;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

export function TerminalTab({
  session,
  isActive,
  onClick,
  onClose,
}: TerminalTabProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1 px-2 py-1 text-xs border transition-colors ${
        isActive
          ? 'bg-pip-green/20 border-pip-green text-pip-green'
          : 'border-vault-brown/30 text-text-muted hover:text-text-secondary hover:border-vault-brown/50'
      }`}
    >
      <span className="text-pip-green">▶</span>
      <span className="max-w-[100px] truncate">{session.title}</span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="opacity-0 group-hover:opacity-100 hover:text-danger transition-opacity ml-1"
      >
        ×
      </span>
    </button>
  );
}
