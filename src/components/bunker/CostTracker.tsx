// ═══════════════════════════════════════════════════════════════
// BUNKER - Cost Tracker Panel
// Floating panel with savings metrics
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import type { CostTrackerProps } from '../../lib/types';

export function CostTracker({ metrics }: CostTrackerProps) {
  return (
    <motion.div
      className="vault-panel w-64"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-border-warning/50 bg-metal-rust/50">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <motion.span
            className="text-caution"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚠️
          </motion.span>
          RESOURCE EXPENDITURE
        </h3>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        {/* Today */}
        <MetricRow
          label="TODAY"
          value={`$${metrics.today.toFixed(2)}`}
          change={metrics.todayVsCloud}
          saved={metrics.savedToday}
        />

        <Divider />

        {/* Week */}
        <MetricRow
          label="THIS WEEK"
          value={`$${metrics.week.toFixed(2)}`}
          change={metrics.weekVsCloud}
        />

        {/* Month */}
        <MetricRow
          label="THIS MONTH"
          value={`$${metrics.month.toFixed(2)}`}
          change={metrics.monthVsCloud}
        />

        <Divider />

        {/* Total Spent */}
        <div className="text-center py-2">
          <motion.div
            className="terminal-text text-lg font-bold"
            animate={{ textShadow: ['0 0 10px #00ff00', '0 0 20px #00ff00', '0 0 10px #00ff00'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ${metrics.totalSaved.toFixed(2)}
          </motion.div>
          <div className="text-text-muted text-xs mt-1 heading-text">
            TOTAL SPENT
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricRow({
  label,
  value,
  change,
  saved
}: {
  label: string;
  value: string;
  change: number;
  saved?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted text-xs">{label}:</span>
      <div className="text-right">
        <span className="metric-text text-sm">{value}</span>
        {change > 0 && (
          <span className="text-safe text-xs ml-2">
            ▼ -{change}%
          </span>
        )}
        {saved !== undefined && saved > 0 && (
          <div className="text-xs">
            <span className="text-text-muted">SAVED: </span>
            <span className="terminal-text">${saved.toFixed(2)}</span>
            <span className="text-caution ml-1">☢ SECURED</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="border-t border-border-warning/30 my-2" />
  );
}
