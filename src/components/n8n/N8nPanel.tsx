// ═══════════════════════════════════════════════════════════════
// BUNKER - n8n Integration Panel
// Workflow automation management - embedded in-app
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

interface N8nStartResult {
  success: boolean;
  message: string;
  already_running: boolean;
}

interface N8nStatus {
  running: boolean;
  url: string;
}

const N8N_URL = 'http://localhost:5678';
const HEALTH_CHECK_INTERVAL = 10000;
const MAX_RETRIES = 5;

export function N8nPanel() {
  const [status, setStatus] = useState<N8nStatus>({ running: false, url: N8N_URL });
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [startAttempted, setStartAttempted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-start n8n on mount
  const startN8n = useCallback(async () => {
    if (startAttempted) return;
    setStartAttempted(true);

    try {
      const result = await invoke<N8nStartResult>('start_n8n');
      console.log('n8n start result:', result);
    } catch (e) {
      console.error('Failed to start n8n:', e);
    }
  }, [startAttempted]);

  const checkN8nStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${N8N_URL}/api/v1/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        setStatus({ running: true, url: N8N_URL });
        setRetryCount(0); // Reset retries on success
      } else {
        throw new Error('Health check failed');
      }
    } catch {
      setStatus({ running: false, url: N8N_URL });

      // Auto-retry logic if we haven't hit max retries
      if (retryCount < MAX_RETRIES) {
        const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkN8nStatus();
        }, timeout);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  // Auto-start n8n on mount
  useEffect(() => {
    startN8n();
  }, [startN8n]);

  // Initial check and periodic polling
  useEffect(() => {
    // Delay initial check to give n8n time to start
    const initialCheckTimeout = setTimeout(() => {
      checkN8nStatus();
    }, 2000);

    // Only poll if running or we are not in active retry loop
    const interval = setInterval(() => {
      if (status.running || retryCount >= MAX_RETRIES) {
        checkN8nStatus();
      }
    }, HEALTH_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  const goHome = () => {
    if (iframeRef.current) {
      iframeRef.current.src = N8N_URL;
    }
  };

  const handleRetry = async () => {
    setRetryCount(0);
    setStartAttempted(false);
    await startN8n();
    // Give n8n a moment to start before checking
    setTimeout(checkN8nStatus, 2000);
  };

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex items-center justify-between flex-shrink-0">
        <h2 className="heading-text text-sm flex items-center gap-2">
          <motion.span
            className="text-vault-yellow"
            animate={{ opacity: [1, 0.5, 1], rotate: status.running ? 0 : 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ⚡
          </motion.span>
          N8N WORKFLOWS
        </h2>
        <div className="flex gap-2 items-center">
          {/* Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 border transition-colors duration-300 ${status.running
            ? 'border-safe/50 text-safe bg-safe/10'
            : 'border-danger/50 text-danger bg-danger/10'
            }`}>
            <span className={`w-2 h-2 rounded-full ${status.running ? 'bg-safe animate-pulse' : 'bg-danger'}`} />
            <span className="text-[10px] font-mono">
              {status.running ? 'ONLINE' : loading ? 'CHECKING...' : 'OFFLINE'}
            </span>
          </div>

          <div className="h-4 w-px bg-border-warning/30 mx-1" />

          {status.running ? (
            <>
              <button
                className="vault-button vault-button-small hover:text-vault-yellow transition-colors"
                onClick={goHome}
                title="Go to Dashboard"
              >
                🏠 HOME
              </button>
              <button
                className="vault-button vault-button-small hover:text-safe transition-colors"
                onClick={reloadIframe}
                title="Force Reload"
              >
                🔄 RELOAD
              </button>
            </>
          ) : (
            <button
              className="vault-button vault-button-small hover:text-vault-yellow transition-colors"
              onClick={handleRetry}
              disabled={loading}
            >
              🔄 RETRY CONNECTION
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-concrete-dark">
        <AnimatePresence mode="wait">
          {(!status.running && !loading) ? (
            <motion.div
              key="offline"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex items-center justify-center h-full w-full absolute inset-0 z-10"
            >
              <div className="text-center py-12 max-w-lg mx-auto p-8 border border-border-warning/30 bg-black/40 backdrop-blur-sm">
                <div className="text-6xl mb-6 filter drop-shadow-[0_0_15px_rgba(255,68,68,0.5)]">⚠️</div>
                <div className="heading-text text-danger text-xl mb-4 tracking-widest">SYSTEM OFFLINE</div>
                <p className="text-text-muted text-sm mb-8 font-light">
                  The automation subsystem is starting up or unreachable.
                </p>

                <div className="flex justify-center gap-4 mb-8">
                  <button
                    className="px-6 py-2 bg-vault-yellow/10 border border-vault-yellow text-vault-yellow hover:bg-vault-yellow/20 transition-all active:scale-95 font-mono text-xs uppercase"
                    onClick={handleRetry}
                  >
                    Start n8n
                  </button>
                </div>

                <div className="p-4 bg-black/50 border border-border-warning/30 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-50 text-[10px] font-mono text-text-muted">AUTO-START</div>
                  <div className="heading-text text-xs mb-3 text-vault-yellow flex items-center gap-2">
                    <span>{'>'}_</span> STATUS
                  </div>
                  <p className="text-[11px] text-text-muted">
                    n8n will auto-start when you open this panel. If it doesn't connect, click "Start n8n" above.
                    The first startup may take 30-60 seconds.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="iframe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={N8N_URL}
                className="w-full h-full border-0 bg-white"
                title="n8n Workflow Automation"
                allow="clipboard-read; clipboard-write"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {loading && !status.running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-vault-yellow/30 border-t-vault-yellow rounded-full animate-spin" />
              <div className="text-vault-yellow font-mono text-xs tracking-widest animate-pulse">ESTABLISHING LINK...</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-1 border-t border-border-warning/30 bg-concrete-dark/50 flex justify-between text-[10px] text-text-muted flex-shrink-0 font-mono">
        <span className="flex items-center gap-2">
          TARGET: <span className="text-text-primary">{status.url}</span>
        </span>
        <span className={status.running ? 'text-safe' : 'text-danger'}>
          {status.running ? '● LINK ESTABLISHED' : '○ SIGNAL LOST'}
        </span>
      </div>
    </div>
  );
}

export default N8nPanel;
