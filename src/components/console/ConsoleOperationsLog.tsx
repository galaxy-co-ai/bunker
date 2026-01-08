// ═══════════════════════════════════════════════════════════════
// BUNKER - Console Operations Log Component
// Real-time operations log with backend data
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import type { Operation, PtyResult } from '../../lib/console/types';

export function ConsoleOperationsLog() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOperations = async () => {
    try {
      const result = await invoke<Operation[]>('get_operations_log', { limit: 100 });
      setOperations(result);
    } catch (e) {
      console.error('Failed to fetch operations:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOperations();
    // Refresh every 5 seconds
    const interval = setInterval(fetchOperations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = JSON.stringify(operations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunker-operations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = async () => {
    try {
      await invoke<PtyResult>('clear_operations_log');
      setOperations([]);
    } catch (e) {
      console.error('Failed to clear operations:', e);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'text-safe';
      case 'failed':
      case 'error': return 'text-danger';
      case 'running':
      case 'in_progress': return 'text-caution';
      default: return 'text-text-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return '✓';
      case 'failed':
      case 'error': return '✗';
      case 'running':
      case 'in_progress': return '◎';
      default: return '○';
    }
  };

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <span className="text-terminal-amber">◈</span>
          OPERATIONS LOG
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handleExport}
            className="px-2 py-0.5 text-[9px] font-mono border border-border-warning/30 text-text-muted hover:text-vault-yellow hover:border-vault-yellow/50 transition-colors"
          >
            EXPORT
          </button>
          <button
            onClick={handleClear}
            className="px-2 py-0.5 text-[9px] font-mono border border-danger/30 text-danger/70 hover:text-danger hover:border-danger/50 transition-colors"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && operations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <motion.span
              className="terminal-text text-sm"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              LOADING...
            </motion.span>
          </div>
        ) : operations.length === 0 ? (
          <div className="text-text-muted text-xs text-center py-8">
            No operations logged yet.
            <br />
            <span className="text-[10px]">Operations will appear here as you use the system.</span>
          </div>
        ) : (
          <div className="divide-y divide-border-warning/10">
            <AnimatePresence>
              {operations.map((op, index) => (
                <OperationRow
                  key={op.id}
                  operation={op}
                  index={index}
                  formatTime={formatTime}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-border-warning/30 bg-concrete-dark/50 flex-shrink-0">
        <span className="text-[9px] text-text-muted">
          {operations.length} operations | Auto-refresh: 5s
        </span>
      </div>
    </div>
  );
}

function OperationRow({
  operation,
  index,
  formatTime,
  getStatusColor,
  getStatusIcon,
}: {
  operation: Operation;
  index: number;
  formatTime: (timestamp: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!operation.details;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`
          px-3 py-2 flex items-center gap-3 text-[10px]
          ${hasDetails ? 'cursor-pointer hover:bg-vault-yellow/5' : ''}
          ${expanded ? 'bg-vault-yellow/10' : ''}
        `}
      >
        {/* Time */}
        <span className="terminal-text w-16 flex-shrink-0">
          {formatTime(operation.timestamp)}
        </span>

        {/* Status Icon */}
        <span className={`w-4 flex-shrink-0 ${getStatusColor(operation.status)}`}>
          {getStatusIcon(operation.status)}
        </span>

        {/* Operation Type */}
        <span className="text-vault-yellow w-20 flex-shrink-0 uppercase font-mono">
          {operation.operation_type}
        </span>

        {/* Target */}
        <span className="text-text-secondary flex-1 truncate" title={operation.target}>
          {operation.target}
        </span>

        {/* Duration */}
        {operation.duration_ms !== null && (
          <span className="text-text-muted w-16 text-right flex-shrink-0">
            {operation.duration_ms}ms
          </span>
        )}

        {/* Expand indicator */}
        {hasDetails && (
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-text-muted w-4 flex-shrink-0"
          >
            ▼
          </motion.span>
        )}
      </motion.div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/30 border-y border-border-warning/20"
          >
            <div className="px-3 py-2">
              <div className="text-[9px] text-text-muted mb-1">DETAILS:</div>
              <pre className="terminal-text text-[10px] whitespace-pre-wrap break-all">
                {operation.details}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
