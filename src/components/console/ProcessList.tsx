// ═══════════════════════════════════════════════════════════════
// BUNKER - Process List Component
// Running processes display with resource usage
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import type { ProcessInfo } from '../../lib/console/types';

// Highlight these processes as important
const IMPORTANT_PROCESSES = [
  'ollama', 'node', 'bunker', 'claude', 'python', 'npm', 'cargo', 'rustc',
  'docker', 'postgres', 'redis', 'mongod', 'mysql'
];

export function ProcessList() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'important'>('important');

  const fetchProcesses = async () => {
    try {
      const result = await invoke<ProcessInfo[]>('get_process_list');
      setProcesses(result);
      setError(null);
    } catch (e) {
      setError(`Failed to get processes: ${e}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000); // Refresh every 5 seconds (reduced from 3s)
    return () => clearInterval(interval);
  }, []);

  const isImportant = (name: string) => {
    const lowerName = name.toLowerCase();
    return IMPORTANT_PROCESSES.some(p => lowerName.includes(p));
  };

  const filteredProcesses = filter === 'important'
    ? processes.filter(p => isImportant(p.name))
    : processes;

  const displayProcesses = filteredProcesses.slice(0, 20);

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <span className="text-terminal-amber">⚙</span>
          PROCESSES
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('important')}
            className={`px-2 py-0.5 text-[9px] font-mono border transition-colors ${
              filter === 'important'
                ? 'border-vault-yellow text-vault-yellow bg-vault-yellow/10'
                : 'border-border-warning/30 text-text-muted hover:border-vault-yellow/50'
            }`}
          >
            KEY
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 text-[9px] font-mono border transition-colors ${
              filter === 'all'
                ? 'border-vault-yellow text-vault-yellow bg-vault-yellow/10'
                : 'border-border-warning/30 text-text-muted hover:border-vault-yellow/50'
            }`}
          >
            ALL
          </button>
        </div>
      </div>

      {/* Process List */}
      <div className="flex-1 overflow-y-auto">
        {loading && processes.length === 0 ? (
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
        ) : displayProcesses.length === 0 ? (
          <div className="text-text-muted text-xs text-center py-4">
            No matching processes
          </div>
        ) : (
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-concrete-dark">
              <tr className="text-text-muted heading-text border-b border-border-warning/20">
                <th className="text-left px-2 py-1">NAME</th>
                <th className="text-right px-2 py-1">CPU</th>
                <th className="text-right px-2 py-1">MEM</th>
              </tr>
            </thead>
            <tbody>
              {displayProcesses.map((proc, index) => (
                <tr
                  key={`${proc.pid}-${index}`}
                  className={`border-b border-border-warning/10 hover:bg-vault-yellow/5 ${
                    isImportant(proc.name) ? 'text-vault-yellow' : 'text-text-secondary'
                  }`}
                >
                  <td className="px-2 py-1 font-mono truncate max-w-[120px]" title={proc.name}>
                    {proc.name}
                  </td>
                  <td className={`px-2 py-1 text-right font-mono ${
                    proc.cpu_usage > 50 ? 'text-danger' :
                    proc.cpu_usage > 20 ? 'text-caution' : ''
                  }`}>
                    {proc.cpu_usage.toFixed(1)}%
                  </td>
                  <td className="px-2 py-1 text-right font-mono">
                    {proc.memory_mb}MB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-border-warning/30 bg-concrete-dark/50 flex justify-between flex-shrink-0">
        <span className="text-[9px] text-text-muted">
          {displayProcesses.length} / {processes.length}
        </span>
        <span className="text-[9px] text-text-muted">
          REFRESH: 5s
        </span>
      </div>
    </div>
  );
}
