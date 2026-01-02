// ═══════════════════════════════════════════════════════════════
// BUNKER Roster System - Main Export
// ═══════════════════════════════════════════════════════════════

export * from './types';
export * from './agents';
export * from './tools';

import { agents } from './agents';
import { tools } from './tools';
import type { Roster, RosterView } from './types';

// Full roster object
export const roster: Roster = {
  agents,
  tools,
  lastUpdated: new Date().toISOString(),
  version: '1.0.0',
};

// Roster statistics
export function getRosterStats() {
  return {
    totalAgents: agents.length,
    activeAgents: agents.filter((a) => a.identity.status === 'active').length,
    standbyAgents: agents.filter((a) => a.identity.status === 'standby').length,
    totalTools: tools.length,
    onlineTools: tools.filter((t) => t.identity.status === 'online').length,
    offlineTools: tools.filter((t) => t.identity.status === 'offline').length,
    enabledTools: tools.filter((t) => t.config.enabled).length,
    toolsNeedingKeys: tools.filter((t) => t.config.api_key_required && !t.config.api_key_set).length,
  };
}

// Get depth chart for a specific role/function
export function getDepthChart(role: string) {
  // For now, return model depth chart
  if (role === 'reasoning') {
    return {
      role: 'Heavy Reasoning',
      depth: [
        { level: 1, id: 'tool-005', name: 'Claude Opus', trigger: 'Default for complexity > 8' },
        { level: 2, id: 'tool-002', name: 'Llama 70B', trigger: 'If Claude unavailable' },
        { level: 3, id: 'tool-003', name: 'Nemotron 70B', trigger: 'If Llama 70B unavailable' },
        { level: 4, id: 'tool-006', name: 'GPT-4o', trigger: 'Emergency fallback' },
      ],
    };
  }

  if (role === 'fast-tasks') {
    return {
      role: 'Fast Tasks',
      depth: [
        { level: 1, id: 'tool-004', name: 'Llama 8B', trigger: 'Default for complexity < 5' },
        { level: 2, id: 'tool-003', name: 'Nemotron 70B', trigger: 'If 8B overloaded' },
        { level: 3, id: 'tool-006', name: 'GPT-4o-mini', trigger: 'If local unavailable' },
      ],
    };
  }

  if (role === 'research') {
    return {
      role: 'Research & Search',
      depth: [
        { level: 1, id: 'tool-008', name: 'Perplexity', trigger: 'Default for search tasks' },
        { level: 2, id: 'tool-007', name: 'Gemini Pro', trigger: 'If Perplexity unavailable' },
        { level: 3, id: 'tool-005', name: 'Claude Sonnet', trigger: 'Fallback with web tools' },
      ],
    };
  }

  return null;
}

// View mode descriptions
export const viewModes: { key: RosterView; label: string; description: string }[] = [
  { key: 'grid', label: 'Card Grid', description: 'Visual cards for quick browsing' },
  { key: 'table', label: 'Table', description: 'Sortable list with all details' },
  { key: 'depth', label: 'Depth Chart', description: 'Starters and backups per role' },
  { key: 'org', label: 'Org Chart', description: 'Hierarchy and reporting structure' },
];
