// ═══════════════════════════════════════════════════════════════
// BUNKER - Main Dashboard Application
// Fallout-Inspired AI Command Center
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/bunker/Header';
import { SystemHealth } from './components/bunker/SystemHealth';
import { TaskFlow } from './components/bunker/TaskFlow';
import { LiveQueue } from './components/bunker/LiveQueue';
import { OperationsLog } from './components/bunker/OperationsLog';
import { CostTracker } from './components/bunker/CostTracker';
import { QuickActions } from './components/bunker/QuickActions';
import { RosterPanel } from './components/roster';
import {
  mockModels,
  mockQueueTasks,
  mockOperations,
  mockCostMetrics,
  mockFlowNodes,
  mockFlowEdges,
} from './lib/mock-data';

type AppView = 'dashboard' | 'roster';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate uptime (mock - 7 days 12 hours 34 minutes + current seconds)
  const getUptime = () => {
    const seconds = currentTime.getSeconds();
    return `7D 12H ${34 + Math.floor(seconds / 60)}M`;
  };

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
        <div className="flex items-center px-4">
          <nav className="flex gap-1">
            {[
              { key: 'dashboard', label: 'DASHBOARD', icon: '\u2302' },
              { key: 'roster', label: 'ROSTER', icon: '\u2630' },
            ].map((tab) => (
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
                  models={mockModels}
                  totalRam={32}
                  totalRamUsed={20}
                  cpuUsage={45}
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
                  tasks={mockQueueTasks}
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
                operations={mockOperations}
                onExport={() => console.log('Export logs')}
                onClear={() => console.log('Clear logs')}
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="roster"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-4 overflow-hidden"
          >
            <RosterPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Panels (only on dashboard) */}
      {activeView === 'dashboard' && (
        <div className="fixed top-32 right-4 space-y-4 z-50">
          <CostTracker metrics={mockCostMetrics} />
          <QuickActions />
        </div>
      )}

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
