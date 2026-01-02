// ═══════════════════════════════════════════════════════════════
// BUNKER - Quick Actions Panel
// Floating panel with action buttons
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      icon: '🧪',
      label: 'TEST MODEL',
      onClick: () => console.log('Test model'),
    },
    {
      icon: '📊',
      label: 'ANALYTICS',
      onClick: () => console.log('View analytics'),
    },
    {
      icon: '⚙️',
      label: 'CONFIGURE',
      onClick: () => console.log('Configure router'),
    },
    {
      icon: '🔄',
      label: 'REFRESH',
      onClick: () => console.log('Refresh models'),
      variant: 'success',
    },
    {
      icon: '🚨',
      label: 'ERRORS',
      onClick: () => console.log('View errors'),
      variant: 'danger',
    },
  ];

  return (
    <motion.div
      className="vault-panel w-64"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-border-warning/50 bg-metal-rust/50">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <span className="text-terminal-green">⚡</span>
          QUICK ACTIONS
        </h3>
      </div>

      {/* Actions */}
      <div className="p-2 space-y-1">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={action.onClick}
            className={`
              vault-button w-full text-left flex items-center gap-3
              ${action.variant === 'danger' ? 'vault-button-danger' : ''}
              ${action.variant === 'success' ? 'border-safe text-safe hover:border-safe' : ''}
            `}
          >
            <span className="text-lg">{action.icon}</span>
            <span className="text-xs">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
