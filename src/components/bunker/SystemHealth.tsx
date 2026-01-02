// ═══════════════════════════════════════════════════════════════
// BUNKER - System Health Panel
// Left sidebar with model status cards and gauges
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { CircularGauge } from './CircularGauge';
import { LEDIndicator, StatusBadge } from './StatusBadge';
import type { SystemHealthProps, ModelStatus } from '../../lib/types';

export function SystemHealth({
  models,
  totalRam,
  totalRamUsed,
  cpuUsage
}: SystemHealthProps) {
  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-border-warning/50 bg-metal-rust/50">
        <h2 className="heading-text text-sm flex items-center gap-2">
          <span className="text-vault-yellow">⚡</span>
          SYSTEM HEALTH
        </h2>
      </div>

      {/* System Overview */}
      <div className="p-4 border-b border-border-warning/30">
        <div className="flex justify-around">
          <CircularGauge
            value={totalRamUsed}
            max={totalRam}
            label="RAM"
            size={80}
          />
          <CircularGauge
            value={cpuUsage}
            max={100}
            label="CPU"
            size={80}
            showPercentage
          />
        </div>
      </div>

      {/* Model List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ModelCard model={model} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ModelCard({ model }: { model: ModelStatus }) {
  const isCloud = model.id === 'claude';

  return (
    <div className={`
      vault-panel-dark p-3 transition-all duration-200
      ${model.status === 'active' ? 'border-safe/50' : ''}
      hover:border-vault-yellow/50
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <LEDIndicator status={model.status} />
          <span className="heading-text text-xs">{model.name}</span>
        </div>
        <StatusBadge status={model.status} size="sm" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {!isCloud && (
          <>
            <StatRow
              label="RAM"
              value={model.status === 'active' || model.status === 'idle'
                ? `${model.ramUsage}/${model.ramCapacity}GB`
                : '---'
              }
            />
            <StatRow
              label="TEMP"
              value={model.temperature > 0 ? `${model.temperature}°C` : '---'}
              warning={model.temperature > 70}
            />
          </>
        )}
        <StatRow label="TASKS" value={model.tasksToday.toString()} />
        <StatRow label="AVG" value={`${model.avgResponseTime}ms`} />
      </div>

      {/* Quick Actions */}
      {model.status === 'active' && (
        <div className="flex gap-2 mt-3">
          <button className="vault-button vault-button-small flex-1">
            TEST
          </button>
          <button className="vault-button vault-button-small vault-button-danger flex-1">
            STOP
          </button>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  warning = false
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}:</span>
      <span className={warning ? 'text-warning' : 'terminal-amber'}>
        {value}
      </span>
    </div>
  );
}
