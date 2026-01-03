// ═══════════════════════════════════════════════════════════════
// BUNKER - Tool Use Block
// Displays tool calls and results in chat
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToolUseChunk, ToolExecutionResult } from '../../lib/types/claude';

interface ToolUseBlockProps {
  toolUse: ToolUseChunk;
  result?: ToolExecutionResult;
  isExecuting?: boolean;
}

export function ToolUseBlock({ toolUse, result, isExecuting }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'read_file':
        return '📄';
      case 'write_file':
        return '✏️';
      case 'search_files':
        return '🔍';
      case 'execute_command':
        return '▶';
      case 'list_directory':
        return '📁';
      default:
        return '🔧';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-2 border border-vault-brown/40 bg-concrete-dark/50 rounded"
    >
      {/* Tool Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-vault-brown/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getToolIcon(toolUse.name)}</span>
          <span className="terminal-text text-sm">{toolUse.name}</span>
          {isExecuting && (
            <motion.span
              className="text-caution text-xs"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              EXECUTING...
            </motion.span>
          )}
          {result && (
            <span className={`text-xs ${result.success ? 'text-safe' : 'text-danger'}`}>
              {result.success ? '✓ SUCCESS' : '✗ FAILED'}
            </span>
          )}
        </div>
        <span className="text-text-muted text-xs">
          {expanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {/* Input Parameters */}
              <div>
                <div className="text-text-muted text-xs mb-1">INPUT:</div>
                <pre className="bg-black/30 p-2 rounded text-xs text-text-secondary overflow-x-auto">
                  {JSON.stringify(toolUse.input, null, 2)}
                </pre>
              </div>

              {/* Result Output */}
              {result && (
                <div>
                  <div className="text-text-muted text-xs mb-1">OUTPUT:</div>
                  <pre className={`p-2 rounded text-xs overflow-x-auto max-h-48 ${
                    result.success ? 'bg-safe/10 text-safe' : 'bg-danger/10 text-danger'
                  }`}>
                    {result.error || result.output || '(no output)'}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Compact tool use indicator for inline display
export function ToolUseIndicator({ name, isExecuting }: { name: string; isExecuting?: boolean }) {
  const getToolIcon = (n: string) => {
    switch (n) {
      case 'read_file': return '📄';
      case 'write_file': return '✏️';
      case 'search_files': return '🔍';
      case 'execute_command': return '▶';
      case 'list_directory': return '📁';
      default: return '🔧';
    }
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-vault-brown/20 border border-vault-brown/30 rounded text-xs">
      <span>{getToolIcon(name)}</span>
      <span className="terminal-text">{name}</span>
      {isExecuting && (
        <motion.span
          className="text-caution"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ...
        </motion.span>
      )}
    </span>
  );
}
