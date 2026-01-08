// ═══════════════════════════════════════════════════════════════
// BUNKER - useTerminal Hook
// Manages PTY terminal state and xterm.js integration
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { PTY_COMMANDS } from '../lib/tauri-commands';
import type { PtyResult, PtyOutput, PtySignal } from '../lib/console/types';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export interface TerminalConfig {
  theme?: TerminalTheme;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  cursorBlink?: boolean;
  cursorStyle?: 'block' | 'underline' | 'bar';
  maxReconnectAttempts?: number;
  autoConnect?: boolean;
  autoReconnect?: boolean;
}

export interface UseTerminalReturn {
  terminalRef: React.RefObject<HTMLDivElement>;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  write: (data: string) => Promise<void>;
  sendSignal: (signal: PtySignal) => Promise<void>;
  clear: () => void;
  focus: () => void;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT THEME - Fallout/Vault-Tec inspired
// ═══════════════════════════════════════════════════════════════

const DEFAULT_THEME: TerminalTheme = {
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
};

const DEFAULT_CONFIG: Required<TerminalConfig> = {
  theme: DEFAULT_THEME,
  fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  fontSize: 13,
  lineHeight: 1.2,
  cursorBlink: true,
  cursorStyle: 'block',
  maxReconnectAttempts: 3,
  autoConnect: true,
  autoReconnect: true,
};

// ═══════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

export function useTerminal(config: TerminalConfig = {}): UseTerminalReturn {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isConnectedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const connectionTimeRef = useRef(0); // Track when connection was established

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      theme: mergedConfig.theme,
      fontFamily: mergedConfig.fontFamily,
      fontSize: mergedConfig.fontSize,
      lineHeight: mergedConfig.lineHeight,
      cursorBlink: mergedConfig.cursorBlink,
      cursorStyle: mergedConfig.cursorStyle,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);

    setTimeout(() => {
      fitAddon.fit();
    }, 100);

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle resize - debounce to avoid duplicate prompts on initial connection
    let resizeTimeout: number | null = null;
    let lastResize = { rows: 0, cols: 0 };
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
          // Only send resize if connected, dimensions changed, and after initial prompt
          if (isConnectedRef.current && terminal.cols && terminal.rows) {
            // Wait 500ms after connection before sending resize to let shell initialize
            const timeSinceConnect = Date.now() - connectionTimeRef.current;
            if (timeSinceConnect < 500) return;

            const newRows = terminal.rows;
            const newCols = terminal.cols;
            // Skip if dimensions haven't changed
            if (newRows !== lastResize.rows || newCols !== lastResize.cols) {
              lastResize = { rows: newRows, cols: newCols };
              invoke(PTY_COMMANDS.RESIZE, { rows: newRows, cols: newCols }).catch(console.error);
            }
          }
        }
      }, 250); // Increased debounce to avoid prompt duplication
    });
    resizeObserver.observe(terminalRef.current);

    // Handle user input
    const dataHandler = terminal.onData(async (data) => {
      if (!isConnectedRef.current) return;

      // Handle control characters
      if (data === '\x03') {
        try {
          await invoke(PTY_COMMANDS.SIGNAL, { signal: 'Interrupt' as PtySignal });
        } catch {
          invoke(PTY_COMMANDS.WRITE, { data }).catch(console.error);
        }
        return;
      }
      if (data === '\x04') {
        try {
          await invoke(PTY_COMMANDS.SIGNAL, { signal: 'EOF' as PtySignal });
        } catch {
          invoke(PTY_COMMANDS.WRITE, { data }).catch(console.error);
        }
        return;
      }

      invoke(PTY_COMMANDS.WRITE, { data }).catch(console.error);
    });

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      dataHandler.dispose();
      terminal.dispose();
    };
  }, []);

  // Connect to PTY
  const connect = useCallback(async () => {
    if (isConnectedRef.current) return;

    setIsConnecting(true);
    setError(null);

    const terminal = xtermRef.current;
    if (!terminal) {
      setIsConnecting(false);
      return;
    }

    const rows = terminal.rows || 24;
    const cols = terminal.cols || 80;

    try {
      const result = await invoke<PtyResult>(PTY_COMMANDS.SPAWN, { rows, cols });

      if (result.success) {
        connectionTimeRef.current = Date.now(); // Track connection time for resize grace period
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        terminal.clear();
        terminal.focus();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(`Failed to connect: ${e}`);
    }

    setIsConnecting(false);
  }, []);

  // Disconnect from PTY
  const disconnect = useCallback(async () => {
    try {
      await invoke(PTY_COMMANDS.KILL);
      setIsConnected(false);
    } catch (e) {
      console.error('Failed to disconnect:', e);
    }
  }, []);

  // Write data to PTY
  const write = useCallback(async (data: string) => {
    if (!isConnectedRef.current) return;
    await invoke(PTY_COMMANDS.WRITE, { data });
  }, []);

  // Send signal to PTY
  const sendSignal = useCallback(async (signal: PtySignal) => {
    if (!isConnectedRef.current) return;
    await invoke(PTY_COMMANDS.SIGNAL, { signal });
  }, []);

  // Clear terminal
  const clear = useCallback(() => {
    xtermRef.current?.clear();
  }, []);

  // Focus terminal
  const focus = useCallback(() => {
    xtermRef.current?.focus();
  }, []);

  // Set up event listeners
  useEffect(() => {
    let unlistenOutput: UnlistenFn | null = null;
    let unlistenError: UnlistenFn | null = null;
    let unlistenExit: UnlistenFn | null = null;

    const setupListeners = async () => {
      unlistenOutput = await listen<PtyOutput>('pty-output', (event) => {
        if (xtermRef.current) {
          xtermRef.current.write(event.payload.data);
        }
      });

      unlistenError = await listen<string>('pty-error', (event) => {
        setError(event.payload);
        setIsConnected(false);
      });

      unlistenExit = await listen('pty-exit', () => {
        setIsConnected(false);
        if (xtermRef.current) {
          xtermRef.current.writeln('\r\n\x1b[33m[Session ended]\x1b[0m');

          if (mergedConfig.autoReconnect && reconnectAttemptsRef.current < mergedConfig.maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            xtermRef.current.writeln(
              `\r\n\x1b[36m[Reconnecting... attempt ${reconnectAttemptsRef.current}/${mergedConfig.maxReconnectAttempts}]\x1b[0m`
            );
            setTimeout(() => {
              connect();
            }, 1000);
          } else if (reconnectAttemptsRef.current >= mergedConfig.maxReconnectAttempts) {
            xtermRef.current.writeln('\r\n\x1b[31m[Max reconnect attempts reached]\x1b[0m');
            reconnectAttemptsRef.current = 0;
          }
        }
      });
    };

    setupListeners();

    return () => {
      if (unlistenOutput) unlistenOutput();
      if (unlistenError) unlistenError();
      if (unlistenExit) unlistenExit();
    };
  }, [connect, mergedConfig.autoReconnect, mergedConfig.maxReconnectAttempts]);

  // Auto-connect on mount
  useEffect(() => {
    if (!mergedConfig.autoConnect) return;

    const timer = setTimeout(() => {
      connect();
    }, 300);
    return () => clearTimeout(timer);
  }, [connect, mergedConfig.autoConnect]);

  return {
    terminalRef,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    write,
    sendSignal,
    clear,
    focus,
  };
}

export default useTerminal;
