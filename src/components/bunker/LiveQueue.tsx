// ═══════════════════════════════════════════════════════════════
// BUNKER - Live Queue Panel
// Right sidebar with terminal-style task queue
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { LiveQueueProps, QueueTask } from '../../lib/types';

export function LiveQueue({ tasks, onViewDetails, onCancel }: LiveQueueProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <div className="px-4 py-3 border-b border-border-warning/50 bg-metal-rust/50">
        <div className="terminal-text text-sm flex items-center">
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            &gt;
          </motion.span>
          <span className="ml-1">VAULT-TEC TASK QUEUE</span>
          <span className="text-text-muted ml-2">v2.0.77</span>
          <motion.span
            className="ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            _
          </motion.span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TaskCard
              task={task}
              formatTime={formatTime}
              onViewDetails={onViewDetails}
              onCancel={onCancel}
            />
          </motion.div>
        ))}

        {/* End of queue marker */}
        <div className="terminal-text text-xs text-center py-4 opacity-50">
          &gt;END OF QUEUE_
        </div>
      </div>

      {/* Queue Stats */}
      <div className="px-4 py-2 border-t border-border-warning/30 bg-concrete-dark/50">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>PENDING: {tasks.filter(t => t.status === 'queued').length}</span>
          <span>ACTIVE: {tasks.filter(t => t.status === 'running').length}</span>
          <span>COMPLETE: {tasks.filter(t => t.status === 'success').length}</span>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  formatTime,
  onViewDetails,
  onCancel,
}: {
  task: QueueTask;
  formatTime: (date: Date) => string;
  onViewDetails: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const isActive = task.status === 'running';

  return (
    <div className={`
      vault-panel-dark p-3 transition-all duration-200
      ${isActive ? 'border-safe/50' : ''}
    `}>
      {/* Timestamp and ID */}
      <div className="flex items-center justify-between mb-2">
        <span className="terminal-text text-[10px]">
          [{formatTime(task.timestamp)}]
        </span>
        <span className="text-text-muted text-[10px]">{task.id.toUpperCase()}</span>
      </div>

      {/* Task Info */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="heading-text text-xs">{task.type}</span>
          <StatusBadge status={task.status} size="sm" />
        </div>

        {task.model && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted">MODEL:</span>
            <span className="terminal-amber">{task.model}</span>
          </div>
        )}

        {/* Progress bar for active tasks */}
        {isActive && (
          <div className="mt-2">
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px]">
              <span className="terminal-text">{task.progress}%</span>
              <span className="text-text-muted">
                {(task.duration / 1000).toFixed(1)}s / {(task.estimatedTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* Duration for completed tasks */}
        {task.status === 'success' && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted">DURATION:</span>
            <span className="terminal-text">{task.duration}ms</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(isActive || task.status === 'queued') && (
        <div className="flex gap-2 mt-3">
          <button
            className="vault-button vault-button-small flex-1"
            onClick={() => onViewDetails(task.id)}
          >
            DETAILS
          </button>
          <button
            className="vault-button vault-button-small vault-button-danger flex-1"
            onClick={() => onCancel(task.id)}
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
}
