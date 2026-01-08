// ═══════════════════════════════════════════════════════════════
// BUNKER - Boot Sequence Component
// Animated loading screen shown on app startup
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BOOT_MESSAGES = [
  'INITIALIZING VAULT-TEC SYSTEMS...',
  'LOADING AI CORE MODULES...',
  'ESTABLISHING BUNKER CONNECTIONS...',
  'CALIBRATING RADIATION SENSORS...',
  'SYSTEM READY',
];

const STAGE_DELAYS = [0, 200, 400, 600, 800];
const HIDE_DELAY = 1500;

interface BootSequenceProps {
  /** Custom boot messages (optional) */
  messages?: string[];
  /** Duration before hiding in ms (default: 1500) */
  duration?: number;
  /** Callback when boot sequence completes */
  onComplete?: () => void;
}

export function BootSequence({
  messages = BOOT_MESSAGES,
  duration = HIDE_DELAY,
  onComplete,
}: BootSequenceProps) {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Progress through stages
    STAGE_DELAYS.forEach((delay, i) => {
      setTimeout(() => setStage(i + 1), delay);
    });

    // Hide after duration
    const hideTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(hideTimer);
  }, [duration, onComplete]);

  if (!visible) return null;

  const totalStages = messages.length;

  return (
    <motion.div
      className="fixed inset-0 bg-concrete-dark z-[100] flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        {/* Radiation Icon */}
        <motion.div
          className="text-vault-yellow text-4xl mb-8"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ☢️
        </motion.div>

        {/* Boot Messages */}
        <div className="terminal-text text-sm space-y-1">
          {messages.slice(0, stage).map((msg, i) => {
            const isCurrentStage = i === stage - 1;
            const isComplete = stage >= totalStages;
            const isInProgress = isCurrentStage && !isComplete;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={isInProgress ? 'text-caution' : 'text-safe'}
              >
                {isInProgress ? '>>> ' : '✓ '}
                {msg}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <motion.div
          className="mt-6 w-64 h-1 bg-concrete-medium rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-vault-yellow"
            initial={{ width: '0%' }}
            animate={{ width: `${(stage / totalStages) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default BootSequence;
