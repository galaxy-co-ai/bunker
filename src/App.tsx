// ═══════════════════════════════════════════════════════════════
// BUNKER - Main Dashboard Application
// Fallout-Inspired AI Command Center with Claude & Terminal
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/bunker/Header';
import { SystemHealth } from './components/bunker/SystemHealth';
import { TaskFlow } from './components/bunker/TaskFlow';
import { LiveQueue } from './components/bunker/LiveQueue';
import { OperationsLog } from './components/bunker/OperationsLog';
import { CostTracker } from './components/bunker/CostTracker';
import { QuickActions } from './components/bunker/QuickActions';
import { RosterPanel } from './components/roster';
import { ChatPanel } from './components/chat';
import { TerminalPanel } from './components/terminal';
import { SettingsPanel } from './components/settings';
import { useSettingsStore, useMetricsStore } from './lib/store';
import type { ModelStatus, CostMetrics, Operation, QueueTask } from './lib/types';
import {
  mockFlowNodes,
  mockFlowEdges,
} from './lib/mock-data';

type AppView = 'dashboard' | 'roster' | 'terminal' | 'chat';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const { openSettings, apiKeyStatuses } = useSettingsStore();
  const { costSummary, apiCalls, tasks } = useMetricsStore();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // TODO: Re-enable when keyring commands are registered in lib.rs
  // useEffect(() => {
  //   useSettingsStore.getState().refreshApiKeyStatuses();
  // }, []);

  // Build real model status from API keys
  const realModels: ModelStatus[] = useMemo(() => {
    const todayCalls = apiCalls.filter((c) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return c.timestamp >= startOfDay.getTime();
    });

    return apiKeyStatuses
      .filter((k) => k.isSet)
      .map((k) => {
        const providerCalls = todayCalls.filter((c) => {
          const keyToProvider: Record<string, string> = {
            ANTHROPIC_API_KEY: 'claude',
            OPENAI_API_KEY: 'openai',
            PERPLEXITY_API_KEY: 'perplexity',
            GEMINI_API_KEY: 'gemini',
          };
          return c.provider === keyToProvider[k.name];
        });

        const avgResponseTime =
          providerCalls.length > 0
            ? Math.round(
                providerCalls.reduce((sum, c) => sum + c.responseTimeMs, 0) /
                  providerCalls.length
              )
            : 0;

        return {
          id: k.name,
          name: k.displayName.toUpperCase(),
          status: k.isConnected ? 'active' : 'offline',
          ramUsage: 0, // Cloud APIs don't use RAM
          ramCapacity: 0,
          temperature: 0,
          uptime: k.isConnected ? 'ONLINE' : '---',
          tasksToday: providerCalls.length,
          avgResponseTime,
        } as ModelStatus;
      });
  }, [apiKeyStatuses, apiCalls]);

  // Build real cost metrics
  const realCostMetrics: CostMetrics = useMemo(() => {
    return {
      today: costSummary.today,
      todayVsCloud: 0, // No savings since we're cloud-only
      savedToday: 0,
      week: costSummary.week,
      weekVsCloud: 0,
      month: costSummary.month,
      monthVsCloud: 0,
      totalSaved: costSummary.allTime, // Show total spent instead
    };
  }, [costSummary]);

  // Build real operations from tasks
  const realOperations: Operation[] = useMemo(() => {
    return tasks.slice(0, 50).map((t) => ({
      id: t.id,
      timestamp: new Date(t.timestamp),
      name: t.type,
      status: t.status,
      model: t.model ?? null,
      duration: t.durationMs,
      logs: t.logs,
      output: t.output,
    }));
  }, [tasks]);

  // Build queue tasks from active tasks
  const realQueueTasks: QueueTask[] = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'queued' || t.status === 'running')
      .map((t) => ({
        id: t.id,
        timestamp: new Date(t.timestamp),
        type: t.type,
        status: t.status,
        model: t.model ?? null,
        progress: t.status === 'running' ? 50 : 0, // Estimate progress
        duration: t.durationMs,
        estimatedTime: t.durationMs > 0 ? t.durationMs * 2 : 5000,
      }));
  }, [tasks]);

  // Calculate uptime (mock - 7 days 12 hours 34 minutes + current seconds)
  const getUptime = () => {
    const seconds = currentTime.getSeconds();
    return `7D 12H ${34 + Math.floor(seconds / 60)}M`;
  };

  const navTabs = [
    { key: 'dashboard', label: 'DASHBOARD', icon: '⌂' },
    { key: 'roster', label: 'ROSTER', icon: '☰' },
    { key: 'terminal', label: 'TERMINAL', icon: '▶' },
    { key: 'chat', label: 'CLAUDE', icon: '⚛' },
  ];

  return (
    <div className="min-h-screen bg-concrete-dark text-text-secondary font-body flex flex-col crt-scanlines">
      {/* Header */}
      <Header
        overseerName="DALTON"
        vaultNumber="VAULT-7"
        uptime={getUptime()}
        radiationLevel="LOW"
        temperature={67}
      />

      {/* Navigation Tabs */}
      <div className="flex-shrink-0 bg-concrete-medium border-b border-vault-brown/30">
        <div className="flex items-center justify-between px-4">
          <nav className="flex gap-1">
            {navTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as AppView)}
                className={`
                  px-4 py-2 text-xs border-b-2 transition-colors flex items-center gap-2
                  ${activeView === tab.key
                    ? 'border-vault-yellow text-vault-yellow bg-vault-yellow/10'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-concrete-dark/50'}
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Settings Button */}
          <button
            onClick={openSettings}
            className="px-3 py-1 text-xs border border-vault-brown/30 text-text-muted hover:text-vault-yellow hover:border-vault-yellow transition-colors flex items-center gap-1"
          >
            <span>⚙</span>
            SETTINGS
          </button>
        </div>
      </div>

      {/* Warning Stripe */}
      <div className="warning-stripe" />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeView === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-4 gap-4 overflow-hidden"
          >
            {/* Top Row - 3 Column Grid */}
            <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-4 min-h-0">
              {/* Left: System Health */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SystemHealth
                  models={realModels.length > 0 ? realModels : []}
                  totalRam={0}
                  totalRamUsed={0}
                  cpuUsage={0}
                />
              </motion.div>

              {/* Center: Task Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <TaskFlow
                  nodes={mockFlowNodes}
                  edges={mockFlowEdges}
                  activeParticles={[]}
                />
              </motion.div>

              {/* Right: Live Queue */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <LiveQueue
                  tasks={realQueueTasks}
                  onViewDetails={(id) => console.log('View details:', id)}
                  onCancel={(id) => console.log('Cancel:', id)}
                />
              </motion.div>
            </div>

            {/* Bottom: Operations Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-[220px]"
            >
              <OperationsLog
                operations={realOperations}
                onExport={() => console.log('Export logs')}
                onClear={() => useMetricsStore.getState().reset()}
              />
            </motion.div>
          </motion.div>
        ) : activeView === 'roster' ? (
          <motion.div
            key="roster"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-4 overflow-hidden"
          >
            <RosterPanel />
          </motion.div>
        ) : activeView === 'terminal' ? (
          <motion.div
            key="terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-4 overflow-hidden"
          >
            <TerminalPanel />
          </motion.div>
        ) : activeView === 'chat' ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-4 overflow-hidden"
          >
            <ChatPanel />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Floating Panels (only on dashboard) */}
      {activeView === 'dashboard' && (
        <div className="fixed top-32 right-4 space-y-4 z-50">
          <CostTracker metrics={realCostMetrics} />
          <QuickActions />
        </div>
      )}

      {/* Settings Modal */}
      <SettingsPanel />

      {/* Boot sequence indicator (shows briefly on load) */}
      <BootSequence />
    </div>
  );
}

// Boot sequence animation that plays on load
function BootSequence() {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const stages = [
      { delay: 0 },
      { delay: 200 },
      { delay: 400 },
      { delay: 600 },
      { delay: 800 },
    ];

    stages.forEach((s, i) => {
      setTimeout(() => setStage(i + 1), s.delay);
    });

    setTimeout(() => setVisible(false), 1500);
  }, []);

  if (!visible) return null;

  const messages = [
    'INITIALIZING VAULT-TEC SYSTEMS...',
    'LOADING AI CORE MODULES...',
    'ESTABLISHING BUNKER CONNECTIONS...',
    'CALIBRATING RADIATION SENSORS...',
    'SYSTEM READY',
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-concrete-dark z-[100] flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.div
          className="text-vault-yellow text-4xl mb-8"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ☢️
        </motion.div>
        <div className="terminal-text text-sm space-y-1">
          {messages.slice(0, stage).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={i === stage - 1 && stage < 5 ? 'text-caution' : 'text-safe'}
            >
              {i === stage - 1 && stage < 5 ? '>>> ' : '✓ '}
              {msg}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
