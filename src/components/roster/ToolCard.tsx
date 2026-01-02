// ═══════════════════════════════════════════════════════════════
// Tool Card - Visual card for tool display
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import type { Tool, ToolStatus } from '../../lib/roster/types';

interface ToolCardProps {
  tool: Tool;
  onClick?: () => void;
  onToggle?: (enabled: boolean) => void;
}

const statusColors: Record<ToolStatus, { bg: string; text: string; dot: string }> = {
  online: { bg: 'bg-safe/10', text: 'text-safe', dot: 'bg-safe' },
  degraded: { bg: 'bg-caution/10', text: 'text-caution', dot: 'bg-caution' },
  offline: { bg: 'bg-text-muted/10', text: 'text-text-muted', dot: 'bg-text-muted' },
  deprecated: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
};

const categoryLabels: Record<string, { label: string; color: string }> = {
  'llm-runtime': { label: 'RUNTIME', color: 'text-pip-green' },
  'llm-model': { label: 'MODEL', color: 'text-vault-yellow' },
  'cloud-api': { label: 'CLOUD', color: 'text-blue-400' },
  'automation': { label: 'AUTOMATION', color: 'text-purple-400' },
  'data-enrichment': { label: 'DATA', color: 'text-orange-400' },
  'database': { label: 'DATABASE', color: 'text-red-400' },
  'monitoring': { label: 'MONITORING', color: 'text-cyan-400' },
};

const toolIcons: Record<string, string> = {
  server: '\u2630',    // ☰
  brain: '\u2699',     // ⚙
  cloud: '\u2601',     // ☁
  search: '\u2315',    // ⌕
  workflow: '\u21C4',  // ⇄
  users: '\u263C',     // ☼
  zap: '\u26A1',       // ⚡
  default: '\u25A0',   // ■
};

export function ToolCard({ tool, onClick, onToggle }: ToolCardProps) {
  const status = statusColors[tool.identity.status];
  const category = categoryLabels[tool.role.category] || { label: 'OTHER', color: 'text-text-muted' };
  const icon = toolIcons[tool.identity.icon || 'default'] || toolIcons.default;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        border rounded p-3 cursor-pointer transition-colors
        ${tool.config.enabled
          ? 'border-vault-brown/30 bg-concrete-dark hover:border-vault-yellow/50'
          : 'border-vault-brown/20 bg-concrete-dark/50 opacity-70 hover:opacity-100'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded flex items-center justify-center text-xl ${
            tool.config.enabled ? 'bg-pip-green/20 text-pip-green' : 'bg-text-muted/20 text-text-muted'
          }`}>
            {icon}
          </div>
          <div>
            <div className="text-pip-green text-xs font-bold">{tool.identity.name}</div>
            <div className={`text-[10px] ${category.color}`}>{category.label}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* Status Badge */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${status.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${tool.identity.status === 'online' ? 'animate-pulse' : ''}`} />
            <span className={status.text}>{tool.identity.status.toUpperCase()}</span>
          </div>

          {/* Toggle */}
          {tool.role.category === 'cloud-api' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(!tool.config.enabled);
              }}
              className={`text-[10px] px-2 py-0.5 rounded border ${
                tool.config.enabled
                  ? 'border-safe text-safe'
                  : 'border-text-muted text-text-muted'
              }`}
            >
              {tool.config.enabled ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>

      {/* Purpose */}
      <div className="mb-3">
        <div className="text-[10px] text-text-muted mb-1">PURPOSE</div>
        <div className="text-xs text-text-secondary leading-tight">{tool.role.purpose}</div>
      </div>

      {/* API Key Status (for cloud APIs) */}
      {tool.config.api_key_required && (
        <div className={`mb-3 p-2 rounded border ${
          tool.config.api_key_set
            ? 'bg-safe/10 border-safe/30'
            : 'bg-caution/10 border-caution/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className={tool.config.api_key_set ? 'text-safe' : 'text-caution'}>
              {tool.config.api_key_set ? '\u2713' : '\u26A0'}
            </span>
            <span className={`text-[10px] ${tool.config.api_key_set ? 'text-safe' : 'text-caution'}`}>
              {tool.config.api_key_set ? 'API KEY SET' : 'API KEY REQUIRED'}
            </span>
          </div>
        </div>
      )}

      {/* Fallbacks */}
      {tool.fallback.backup_tools.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-text-muted mb-1">FALLBACKS</div>
          <div className="text-[10px] text-text-secondary">
            {tool.fallback.backup_tools.length} backup{tool.fallback.backup_tools.length > 1 ? 's' : ''} configured
          </div>
        </div>
      )}

      {/* KPIs Preview */}
      <div className="grid grid-cols-2 gap-2">
        {tool.kpis.metrics.slice(0, 2).map((kpi) => (
          <div key={kpi.name} className="bg-concrete-medium rounded p-1.5">
            <div className="text-[9px] text-text-muted truncate">{kpi.name.replace(/_/g, ' ').toUpperCase()}</div>
            <div className="text-xs">
              <span className="text-text-secondary">
                {kpi.current ?? '—'}
              </span>
              <span className="text-text-muted text-[10px]"> / {kpi.target} {kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dependencies */}
      {tool.role.dependencies.length > 0 && (
        <div className="mt-2 pt-2 border-t border-vault-brown/20 text-[10px] text-text-muted">
          Requires: {tool.role.dependencies.join(', ')}
        </div>
      )}
    </motion.div>
  );
}
