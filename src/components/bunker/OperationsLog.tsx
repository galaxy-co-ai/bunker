// ═══════════════════════════════════════════════════════════════
// BUNKER - Operations Log Panel
// Bottom panel with expandable data table
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { OperationsLogProps, Operation } from '../../lib/types';

export function OperationsLog({ operations, onExport, onClear }: OperationsLogProps) {
  return (
    <div className="vault-panel overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between">
        <h2 className="heading-text text-sm flex items-center gap-2">
          <span className="text-terminal-amber">◈</span>
          OPERATIONS LOG
        </h2>
        <div className="flex gap-2">
          <button
            className="vault-button vault-button-small"
            onClick={onExport}
          >
            EXPORT
          </button>
          <button
            className="vault-button vault-button-small vault-button-danger"
            onClick={onClear}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
        <table className="vault-table">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-24">TIME</th>
              <th className="w-48">OPERATION</th>
              <th className="w-28">STATUS</th>
              <th className="w-32">MODEL</th>
              <th className="w-20">DURATION</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation, index) => (
              <OperationRow key={operation.id} operation={operation} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OperationRow({ operation, index }: { operation: Operation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = operation.logs || operation.output;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const getOperationIcon = (status: Operation['status']) => {
    switch (status) {
      case 'running': return '☢';
      case 'queued': return '⚡';
      case 'success': return '✓';
      case 'failed': return '✗';
    }
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`
          ${hasDetails ? 'cursor-pointer' : ''}
          ${expanded ? 'bg-concrete-med' : ''}
        `}
      >
        <td className="terminal-text text-xs">{formatTime(operation.timestamp)}</td>
        <td className="text-text-primary">
          <span className={
            operation.status === 'running' ? 'text-safe' :
            operation.status === 'failed' ? 'text-danger' :
            operation.status === 'success' ? 'text-safe' :
            'text-caution'
          }>
            {getOperationIcon(operation.status)}
          </span>
          <span className="ml-2">{operation.name}</span>
        </td>
        <td><StatusBadge status={operation.status} size="sm" /></td>
        <td className="terminal-amber text-xs">{operation.model || '---'}</td>
        <td className="metric-text text-xs">
          {operation.duration ? `${operation.duration}ms` : '---'}
        </td>
        <td className="text-text-muted">
          {hasDetails && (
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              ▼
            </motion.span>
          )}
        </td>
      </motion.tr>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <td colSpan={6} className="bg-concrete-dark p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4"
              >
                {/* Terminal Logs */}
                {operation.logs && (
                  <div className="mb-4">
                    <div className="text-text-muted text-xs mb-2 heading-text">
                      EXECUTION LOG:
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-border-warning/30 font-terminal text-xs space-y-0.5 max-h-32 overflow-y-auto">
                      {operation.logs.map((log, i) => (
                        <div key={i} className="terminal-text">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output JSON */}
                {operation.output && (
                  <div>
                    <div className="text-text-muted text-xs mb-2 heading-text">
                      OUTPUT:
                    </div>
                    <pre className="bg-black/50 p-3 rounded border border-border-warning/30 terminal-amber text-xs overflow-x-auto">
                      {JSON.stringify(operation.output, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
