// ═══════════════════════════════════════════════════════════════
// BUNKER Roster Panel - Main Container
// Toggle between 4 view modes
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RosterView } from '../../lib/roster/types';
import { agents } from '../../lib/roster/agents';
import { tools } from '../../lib/roster/tools';
import { getRosterStats, viewModes } from '../../lib/roster';
import { AgentCard } from './AgentCard';
import { ToolCard } from './ToolCard';
import { RosterTable } from './RosterTable';
import { DepthChartView } from './DepthChartView';
import { OrgChartView } from './OrgChartView';

interface RosterPanelProps {
  defaultView?: RosterView;
  showAgents?: boolean;
  showTools?: boolean;
}

export function RosterPanel({
  defaultView = 'grid',
  showAgents = true,
  showTools = true,
}: RosterPanelProps) {
  const [view, setView] = useState<RosterView>(defaultView);
  const [activeTab, setActiveTab] = useState<'agents' | 'tools'>('agents');
  const stats = getRosterStats();

  return (
    <div className="h-full flex flex-col bg-concrete-medium border border-vault-brown/30 rounded">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-vault-brown/30 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-vault-yellow text-lg">&#9762;</span>
            <h2 className="terminal-text text-vault-yellow text-sm">ROSTER SYSTEM</h2>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-text-muted">AGENTS:</span>
              <span className="text-safe">{stats.activeAgents}</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">{stats.totalAgents}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">TOOLS:</span>
              <span className="text-safe">{stats.onlineTools}</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">{stats.totalTools}</span>
            </div>
            {stats.toolsNeedingKeys > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-caution">!</span>
                <span className="text-caution">{stats.toolsNeedingKeys} NEED API KEY</span>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs">VIEW:</span>
          <div className="flex gap-1">
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setView(mode.key)}
                className={`px-2 py-1 text-xs border transition-colors ${
                  view === mode.key
                    ? 'bg-vault-yellow/20 border-vault-yellow text-vault-yellow'
                    : 'border-vault-brown/30 text-text-muted hover:text-text-secondary hover:border-vault-brown/50'
                }`}
                title={mode.description}
              >
                {mode.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab Toggle (for grid/table views) */}
          {(view === 'grid' || view === 'table') && (
            <>
              <div className="w-px h-4 bg-vault-brown/30 mx-2" />
              <div className="flex gap-1">
                {showAgents && (
                  <button
                    onClick={() => setActiveTab('agents')}
                    className={`px-2 py-1 text-xs border transition-colors ${
                      activeTab === 'agents'
                        ? 'bg-pip-green/20 border-pip-green text-pip-green'
                        : 'border-vault-brown/30 text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    AGENTS
                  </button>
                )}
                {showTools && (
                  <button
                    onClick={() => setActiveTab('tools')}
                    className={`px-2 py-1 text-xs border transition-colors ${
                      activeTab === 'tools'
                        ? 'bg-pip-green/20 border-pip-green text-pip-green'
                        : 'border-vault-brown/30 text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    TOOLS
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence mode="wait">
          {view === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {activeTab === 'agents'
                ? agents.map((agent) => <AgentCard key={agent.identity.id} agent={agent} />)
                : tools.map((tool) => <ToolCard key={tool.identity.id} tool={tool} />)}
            </motion.div>
          )}

          {view === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RosterTable type={activeTab} />
            </motion.div>
          )}

          {view === 'depth' && (
            <motion.div
              key="depth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DepthChartView />
            </motion.div>
          )}

          {view === 'org' && (
            <motion.div
              key="org"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OrgChartView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
