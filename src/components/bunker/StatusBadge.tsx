// ═══════════════════════════════════════════════════════════════
// BUNKER - Status Badge Component
// Animated status indicators for tasks and operations
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';

type TaskStatus = 'queued' | 'running' | 'success' | 'failed';
type ModelStatus = 'active' | 'idle' | 'swapped' | 'offline';

interface StatusBadgeProps {
  status: TaskStatus | ModelStatus;
  size?: 'sm' | 'md';
}

const taskConfig = {
  queued: {
    icon: '⏸',
    label: 'QUEUED',
    color: 'text-caution',
    bg: 'bg-caution/10',
    border: 'border-caution/30',
  },
  running: {
    icon: '☢',
    label: 'ACTIVE',
    color: 'text-safe',
    bg: 'bg-safe/10',
    border: 'border-safe/30',
  },
  success: {
    icon: '✓',
    label: 'COMPLETE',
    color: 'text-safe',
    bg: 'bg-safe/10',
    border: 'border-safe/30',
  },
  failed: {
    icon: '✗',
    label: 'FAILED',
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
  },
};

const modelConfig = {
  active: {
    icon: '●',
    label: 'ACTIVE',
    color: 'text-safe',
    bg: 'bg-safe/10',
    border: 'border-safe/30',
  },
  idle: {
    icon: '○',
    label: 'IDLE',
    color: 'text-text-muted',
    bg: 'bg-text-muted/10',
    border: 'border-text-muted/30',
  },
  swapped: {
    icon: '◐',
    label: 'SWAPPED',
    color: 'text-caution',
    bg: 'bg-caution/10',
    border: 'border-caution/30',
  },
  offline: {
    icon: '◯',
    label: 'OFFLINE',
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = taskConfig[status as TaskStatus] || modelConfig[status as ModelStatus];
  const isAnimated = status === 'running' || status === 'active';

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1';

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1 font-terminal
        ${config.color} ${config.bg} ${config.border}
        border rounded ${sizeClasses}
      `}
      animate={isAnimated ? { opacity: [1, 0.7, 1] } : {}}
      transition={isAnimated ? { duration: 1.5, repeat: Infinity } : {}}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.span>
  );
}

export function LEDIndicator({ status }: { status: ModelStatus }) {
  const ledClass = {
    active: 'led-active',
    idle: 'led-idle',
    swapped: 'led-warning',
    offline: 'led-danger',
  }[status];

  return <div className={ledClass} />;
}
