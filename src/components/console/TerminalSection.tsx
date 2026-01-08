// ═══════════════════════════════════════════════════════════════
// BUNKER - Terminal Section Component
// Full PTY terminal with xterm.js for interactive programs
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import '@xterm/xterm/css/xterm.css';
import useTerminal from '../../hooks/useTerminal';

export function TerminalSection() {
  const {
    terminalRef,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useTerminal({
    autoConnect: true,
    autoReconnect: true,
    maxReconnectAttempts: 5,
    theme: {
      background: '#1a1a1a',
      foreground: '#d4a857',
      cursor: '#d4a857',
      cursorAccent: '#1a1a1a',
      selectionBackground: '#d4a85750',
      black: '#1a1a1a',
      red: '#ff4444',
      green: '#44ff44',
      yellow: '#d4a857',
      blue: '#4488ff',
      magenta: '#ff44ff',
      cyan: '#44ffff',
      white: '#cccccc',
      brightBlack: '#666666',
      brightRed: '#ff6666',
      brightGreen: '#66ff66',
      brightYellow: '#ffcc66',
      brightBlue: '#66aaff',
      brightMagenta: '#ff66ff',
      brightCyan: '#66ffff',
      brightWhite: '#ffffff',
    }
  });

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <span className="text-terminal-green">{'>'}_</span>
          TERMINAL
        </h3>
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              onClick={() => connect()}
              disabled={isConnecting}
              className="px-2 py-0.5 text-[9px] font-mono border border-safe/50 text-safe hover:bg-safe/20 transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'CONNECTING...' : 'CONNECT'}
            </button>
          ) : (
            <button
              onClick={() => disconnect()}
              className="px-2 py-0.5 text-[9px] font-mono border border-danger/50 text-danger hover:bg-danger/20 transition-colors"
            >
              DISCONNECT
            </button>
          )}
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-safe animate-pulse' : 'bg-text-muted'}`} />
          <span className="text-[9px] text-text-muted">
            {isConnected ? 'CONNECTED' : isConnecting ? 'CONNECTING' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-3 py-2 bg-danger/20 border-b border-danger/50 text-danger text-xs"
        >
          {error}
        </motion.div>
      )}

      {/* Terminal Container */}
      <div
        ref={terminalRef}
        className="flex-1 bg-[#1a1a1a] p-2 overflow-hidden"
        style={{ minHeight: 0 }}
      />

      {/* Footer */}
      <div className="px-3 py-1 border-t border-border-warning/30 bg-concrete-dark/50 flex justify-between items-center flex-shrink-0">
        <span className="text-[9px] text-text-muted">
          PTY: {isConnected ? 'Active' : 'Inactive'} | Type 'claude' to start Claude Code
        </span>
        <span className="text-[9px] text-text-muted">
          Ctrl+C: Interrupt | Ctrl+D: Exit
        </span>
      </div>
    </div>
  );
}

