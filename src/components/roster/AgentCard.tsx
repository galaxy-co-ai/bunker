// ═══════════════════════════════════════════════════════════════
// Agent Card - Visual card for agent display
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import type { Agent, AgentStatus } from '../../lib/roster/types';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

const statusColors: Record<AgentStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-safe/10', text: 'text-safe', dot: 'bg-safe' },
  standby: { bg: 'bg-caution/10', text: 'text-caution', dot: 'bg-caution' },
  offline: { bg: 'bg-text-muted/10', text: 'text-text-muted', dot: 'bg-text-muted' },
  deprecated: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
};

const avatarIcons: Record<string, string> = {
  radiation: '\u2622', // ☢
  code: '\u2318',      // ⌘
  search: '\u2315',    // ⌕
  workflow: '\u21C4',  // ⇄
  brain: '\u2699',     // ⚙
  default: '\u2605',   // ★
};

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const status = statusColors[agent.identity.status];
  const avatar = avatarIcons[agent.identity.avatar || 'default'] || avatarIcons.default;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        border border-vault-brown/30 rounded p-3 cursor-pointer
        bg-concrete-dark hover:border-vault-yellow/50 transition-colors
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-vault-yellow/20 flex items-center justify-center text-vault-yellow text-xl">
            {avatar}
          </div>
          <div>
            <div className="text-vault-yellow text-xs font-bold">{agent.identity.codename}</div>
            <div className="text-text-muted text-[10px] leading-tight max-w-[140px] truncate">
              {agent.identity.title}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${status.bg}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
          <span className={status.text}>{agent.identity.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Model Assignment */}
      <div className="mb-3 p-2 bg-concrete-medium rounded border border-vault-brown/20">
        <div className="text-[10px] text-text-muted mb-1">PRIMARY MODEL</div>
        <div className="text-xs text-pip-green">{agent.assignment.model_primary}</div>
        {agent.assignment.model_fallback.length > 0 && (
          <div className="text-[10px] text-text-muted mt-1">
            +{agent.assignment.model_fallback.length} fallback{agent.assignment.model_fallback.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Responsibilities Preview */}
      <div className="mb-3">
        <div className="text-[10px] text-text-muted mb-1">RESPONSIBILITIES</div>
        <div className="text-[10px] text-text-secondary">
          {agent.scope.responsibilities.slice(0, 2).map((r, i) => (
            <div key={i} className="truncate">• {r}</div>
          ))}
          {agent.scope.responsibilities.length > 2 && (
            <div className="text-text-muted">+{agent.scope.responsibilities.length - 2} more</div>
          )}
        </div>
      </div>

      {/* KPIs Preview */}
      <div className="grid grid-cols-2 gap-2">
        {agent.kpis.metrics.slice(0, 2).map((kpi) => (
          <div key={kpi.name} className="bg-concrete-medium rounded p-1.5">
            <div className="text-[9px] text-text-muted truncate">{kpi.name.replace(/_/g, ' ').toUpperCase()}</div>
            <div className="text-xs">
              <span className={kpi.current && kpi.current >= kpi.target ? 'text-safe' : 'text-caution'}>
                {kpi.current ?? '—'}
              </span>
              <span className="text-text-muted">/{kpi.target}{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reports To */}
      {agent.assignment.reports_to && (
        <div className="mt-2 pt-2 border-t border-vault-brown/20 text-[10px] text-text-muted">
          Reports to: {agent.assignment.reports_to}
        </div>
      )}
    </motion.div>
  );
}
