// ═══════════════════════════════════════════════════════════════
// BUNKER - Header Component
// Vault-Tec warning bar with system status
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import type { HeaderProps } from '../../lib/types';

export function Header({
  overseerName,
  vaultNumber,
  uptime,
  radiationLevel,
  temperature
}: HeaderProps) {
  const radiationConfig = {
    LOW: { color: 'text-safe', glow: 'glow-green' },
    MEDIUM: { color: 'text-caution', glow: 'glow-yellow' },
    HIGH: { color: 'text-warning', glow: '' },
    CRITICAL: { color: 'text-danger', glow: 'glow-red' },
  }[radiationLevel];

  return (
    <header className="bg-metal-rust border-b-4 border-border-warning relative overflow-hidden">
      {/* Animated scan line */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-vault-yellow/5 to-transparent h-20"
        animate={{ y: [-80, 120] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 px-6 py-3">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.span
              className="text-danger text-2xl"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⚠️
            </motion.span>

            <h1 className="heading-text text-xl tracking-wider">
              BUNKER CONTROL SYSTEM
              <span className="text-text-muted ml-2 text-sm">v7.6.2</span>
            </h1>

            <span className="text-text-primary opacity-50">━━</span>

            <span className="terminal-amber text-sm">
              OVERSEER: {overseerName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="led-active" />
            <span className="terminal-text text-xs">SYSTEMS NOMINAL</span>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-6 mt-2 text-xs font-terminal">
          <StatusItem label={vaultNumber} />
          <Divider />
          <StatusItem label={`UPTIME: ${uptime}`} />
          <Divider />
          <span className={`${radiationConfig.color} ${radiationConfig.glow}`}>
            ☢ RADIATION: {radiationLevel}
          </span>
          <Divider />
          <span className={temperature > 70 ? 'text-warning' : 'text-text-secondary'}>
            TEMP: {temperature}°C
          </span>
          <Divider />
          <span className="text-text-muted">
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  );
}

function StatusItem({ label }: { label: string }) {
  return <span className="text-text-secondary">{label}</span>;
}

function Divider() {
  return <span className="text-text-muted opacity-50">┃</span>;
}
