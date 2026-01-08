// ═══════════════════════════════════════════════════════════════
// BUNKER - System Monitor Component
// Real-time CPU, RAM, and Disk usage display
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import type { SystemMetrics } from '../../lib/console/types';

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  percent: number;
  color: string;
}

function MetricBar({ label, value, max, unit, percent, color }: MetricBarProps) {
  const getBarColor = (pct: number) => {
    if (pct >= 90) return 'bg-danger';
    if (pct >= 70) return 'bg-caution';
    return color;
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="heading-text text-text-muted">{label}</span>
        <span className="terminal-text">
          {value.toFixed(1)}{unit} / {max.toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-3 bg-concrete-dark border border-border-warning/30 overflow-hidden">
        <motion.div
          className={`h-full ${getBarColor(percent)}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="text-right text-[10px] terminal-amber">
        {percent.toFixed(1)}%
      </div>
    </div>
  );
}

export function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const result = await invoke<SystemMetrics>('get_system_metrics');
      setMetrics(result);
      setError(null);
    } catch (e) {
      setError(`Failed to get metrics: ${e}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds (reduced from 2s)
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <motion.span
            className="text-terminal-green"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ◆
          </motion.span>
          SYSTEM MONITOR
        </h3>
        <span className="text-[9px] text-text-muted">LIVE</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {loading && !metrics ? (
          <div className="flex items-center justify-center h-full">
            <motion.span
              className="terminal-text text-sm"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              SCANNING...
            </motion.span>
          </div>
        ) : error ? (
          <div className="text-danger text-xs text-center py-4">{error}</div>
        ) : metrics ? (
          <>
            {/* CPU */}
            <MetricBar
              label="CPU"
              value={metrics.cpu_usage}
              max={100}
              unit="%"
              percent={metrics.cpu_usage}
              color="bg-terminal-green"
            />

            {/* RAM */}
            <MetricBar
              label="MEMORY"
              value={metrics.memory_used / 1024}
              max={metrics.memory_total / 1024}
              unit="GB"
              percent={metrics.memory_percent}
              color="bg-vault-blue"
            />

            {/* Disks */}
            {metrics.disks.map((disk, index) => (
              <MetricBar
                key={disk.mount_point || index}
                label={`DISK ${disk.mount_point || disk.name}`}
                value={disk.used_space}
                max={disk.total_space}
                unit="GB"
                percent={disk.usage_percent}
                color="bg-terminal-amber"
              />
            ))}
          </>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-border-warning/30 bg-concrete-dark/50 flex-shrink-0">
        <span className="text-[9px] text-text-muted">
          REFRESH: 5s
        </span>
      </div>
    </div>
  );
}
