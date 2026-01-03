// BUNKER Terminal View
// xterm.js integration component

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { terminal as terminalService } from '../../lib/services/tauri-bridge';
import { FALLOUT_TERMINAL_THEME, DEFAULT_TERMINAL_CONFIG } from '../../lib/types/terminal';
import '@xterm/xterm/css/xterm.css';

interface TerminalViewProps {
  sessionId: string;
}

export function TerminalView({ sessionId }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const unlistenOutputRef = useRef<(() => void) | null>(null);
  const unlistenCloseRef = useRef<(() => void) | null>(null);

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      fitAddonRef.current.fit();
      const { cols, rows } = terminalRef.current;
      terminalService.resize(sessionId, cols, rows).catch(console.error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create terminal instance
    const term = new Terminal({
      theme: FALLOUT_TERMINAL_THEME,
      fontFamily: DEFAULT_TERMINAL_CONFIG.fontFamily,
      fontSize: DEFAULT_TERMINAL_CONFIG.fontSize,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: true,
      scrollback: 10000,
    });

    // Load fit addon
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Try to load WebGL addon for better performance
    try {
      const webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon.dispose();
      });
      term.loadAddon(webglAddon);
    } catch (e) {
      console.warn('WebGL addon failed to load, using canvas renderer');
    }

    // Open terminal in container
    term.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle user input
    term.onData((data) => {
      terminalService.write(sessionId, data).catch(console.error);
    });

    // Listen for output from backend
    terminalService
      .onOutput(sessionId, (data) => {
        term.write(data);
      })
      .then((unlisten) => {
        unlistenOutputRef.current = unlisten;
      });

    // Listen for session close
    terminalService
      .onClose(sessionId, () => {
        term.write('\r\n\x1b[33m[Session ended]\x1b[0m\r\n');
      })
      .then((unlisten) => {
        unlistenCloseRef.current = unlisten;
      });

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    // Initial resize after a short delay to ensure container is ready
    setTimeout(handleResize, 100);

    // Focus terminal
    term.focus();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      unlistenOutputRef.current?.();
      unlistenCloseRef.current?.();
      term.dispose();
    };
  }, [sessionId, handleResize]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0a0f]"
      style={{ padding: '4px' }}
      onClick={() => terminalRef.current?.focus()}
    />
  );
}
