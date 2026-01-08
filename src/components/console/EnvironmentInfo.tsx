// ═══════════════════════════════════════════════════════════════
// BUNKER - Environment Info Component
// System information and tool versions display
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import type { SystemInfo, CommandResult } from '../../lib/console/types';

interface ToolVersion {
  name: string;
  version: string | null;
  status: 'installed' | 'not_found' | 'checking';
}

export function EnvironmentInfo() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [tools, setTools] = useState<ToolVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Get system info
      try {
        const info = await invoke<SystemInfo>('get_system_info');
        setSysInfo(info);
      } catch (e) {
        console.error('Failed to get system info:', e);
      }

      // Check tool versions
      const toolChecks = [
        { name: 'Node.js', cmd: 'node --version' },
        { name: 'npm', cmd: 'npm --version' },
        { name: 'Rust', cmd: 'rustc --version' },
        { name: 'Cargo', cmd: 'cargo --version' },
        { name: 'Git', cmd: 'git --version' },
        { name: 'Ollama', cmd: 'ollama --version' },
        { name: 'Python', cmd: 'python --version' },
      ];

      const results: ToolVersion[] = [];

      for (const tool of toolChecks) {
        try {
          const result = await invoke<CommandResult>('execute_command', { cmd: tool.cmd });
          if (result.success && result.stdout) {
            // Extract version number
            const versionMatch = result.stdout.match(/[\d]+\.[\d]+\.?[\d]*/);
            results.push({
              name: tool.name,
              version: versionMatch ? versionMatch[0] : result.stdout.trim().slice(0, 20),
              status: 'installed'
            });
          } else {
            results.push({ name: tool.name, version: null, status: 'not_found' });
          }
        } catch {
          results.push({ name: tool.name, version: null, status: 'not_found' });
        }
      }

      setTools(results);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div className="vault-panel h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-warning/50 bg-metal-rust/50 flex-shrink-0">
        <h3 className="heading-text text-xs flex items-center gap-2">
          <span className="text-vault-blue">◈</span>
          ENVIRONMENT
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {loading ? (
          <motion.div
            className="text-center py-4"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="terminal-text text-sm">DETECTING...</span>
          </motion.div>
        ) : (
          <>
            {/* System Info */}
            {sysInfo && (
              <div className="vault-panel-dark p-2 space-y-1">
                <div className="text-[10px] heading-text text-text-muted border-b border-border-warning/20 pb-1 mb-2">
                  SYSTEM
                </div>
                <InfoRow label="OS" value={`${sysInfo.os_name} ${sysInfo.os_version}`} />
                <InfoRow label="HOST" value={sysInfo.hostname} />
                <InfoRow label="CPU" value={`${sysInfo.cpu_count} cores`} />
                <InfoRow label="RAM" value={`${(sysInfo.total_memory / 1024).toFixed(1)} GB`} />
              </div>
            )}

            {/* Tools */}
            <div className="vault-panel-dark p-2 space-y-1">
              <div className="text-[10px] heading-text text-text-muted border-b border-border-warning/20 pb-1 mb-2">
                TOOLS
              </div>
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between text-[10px] py-0.5"
                >
                  <span className="text-text-muted">{tool.name}</span>
                  <div className="flex items-center gap-1">
                    {tool.status === 'installed' ? (
                      <>
                        <span className="terminal-text">{tool.version}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                      </>
                    ) : (
                      <>
                        <span className="text-text-muted">—</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paths */}
            <div className="vault-panel-dark p-2 space-y-1">
              <div className="text-[10px] heading-text text-text-muted border-b border-border-warning/20 pb-1 mb-2">
                PATHS
              </div>
              <InfoRow label="VAULT" value="~/.galaxyco-secrets" truncate />
              <InfoRow label="HOME" value="C:/Users/Owner" truncate />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, truncate = false }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[10px] py-0.5">
      <span className="text-text-muted">{label}</span>
      <span
        className={`terminal-text ${truncate ? 'truncate max-w-[100px]' : ''}`}
        title={truncate ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}
