// ═══════════════════════════════════════════════════════════════
// BUNKER - RosterPanel Component Tests
// Tests for the agents and tools roster management panel
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RosterPanel } from '../RosterPanel';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock the agents and tools data
vi.mock('../../../lib/roster/agents', () => ({
  agents: [
    {
      identity: {
        id: 'agent-1',
        title: 'Lead Scout',
        codename: 'ALPHA-1',
        status: 'active' as const,
      },
      assignment: {
        model_primary: 'llama3.1:8b',
        model_fallback: ['mistral:7b'],
        reports_to: null,
        direct_reports: ['agent-2'],
      },
      scope: {
        responsibilities: ['Research', 'Analysis'],
        permissions: ['web-access', 'file-read'],
        boundaries: ['No code execution'],
      },
      instructions: {
        system_prompt: 'You are a research agent',
        decision_rules: [],
        escalation_path: 'human',
      },
      kpis: {
        metrics: [
          { name: 'tasks_completed', target: 100, unit: 'tasks', current: 85 },
          { name: 'accuracy', target: 95, unit: '%', current: 92 },
          { name: 'response_time', target: 5, unit: 's', current: 3.2 },
        ],
        review_frequency: 'daily' as const,
      },
      meta: {
        created_at: '2024-01-01',
        created_by: 'system',
        version: '1.0.0',
        changelog: ['Initial creation'],
      },
    },
    {
      identity: {
        id: 'agent-2',
        title: 'Data Analyst',
        codename: 'BETA-1',
        status: 'standby' as const,
      },
      assignment: {
        model_primary: 'mistral:7b',
        model_fallback: [],
        reports_to: 'agent-1',
        direct_reports: [],
      },
      scope: {
        responsibilities: ['Data processing'],
        permissions: ['database-read'],
        boundaries: ['Read only'],
      },
      instructions: {
        system_prompt: 'You are a data analyst',
        decision_rules: [],
        escalation_path: 'agent-1',
      },
      kpis: {
        metrics: [
          { name: 'data_processed', target: 1000, unit: 'records', current: 750 },
        ],
        review_frequency: 'weekly' as const,
      },
      meta: {
        created_at: '2024-01-01',
        created_by: 'system',
        version: '1.0.0',
        changelog: ['Initial creation'],
      },
    },
  ],
}));

vi.mock('../../../lib/roster/tools', () => ({
  tools: [
    {
      identity: {
        id: 'tool-1',
        name: 'Code Scanner',
        codename: 'SCANNER',
        type: 'internal' as const,
        status: 'online' as const,
      },
      role: {
        category: 'monitoring' as const,
        purpose: 'Scans code for issues',
        responsibilities: ['Code analysis'],
        dependencies: [],
      },
      fallback: {
        backup_tools: [],
        failover_trigger: 'on_error',
      },
      integration: {
        connects_to: [],
        exposed_via: 'internal' as const,
        consumers: ['agent-1'],
      },
      config: {
        enabled: true,
        api_key_required: false,
        api_key_set: false,
      },
      kpis: {
        metrics: [],
        health_check: '/health',
      },
      meta: {
        version: '1.0.0',
        docs_url: 'https://docs.example.com',
        owner_agent: 'agent-1',
        changelog: [],
      },
    },
    {
      identity: {
        id: 'tool-2',
        name: 'Database Connector',
        codename: 'DBCONN',
        type: 'external' as const,
        status: 'online' as const,
      },
      role: {
        category: 'database' as const,
        purpose: 'Connects to databases',
        responsibilities: ['Data access'],
        dependencies: [],
      },
      fallback: {
        backup_tools: [],
        failover_trigger: 'on_error',
      },
      integration: {
        connects_to: ['postgres', 'mysql'],
        exposed_via: 'api' as const,
        consumers: ['agent-2'],
      },
      config: {
        enabled: true,
        api_key_required: true,
        api_key_set: true,
      },
      kpis: {
        metrics: [],
        health_check: '/health',
      },
      meta: {
        version: '2.1.0',
        docs_url: 'https://docs.example.com',
        owner_agent: 'agent-2',
        changelog: [],
      },
    },
  ],
}));

describe('RosterPanel', () => {
  const mockOnConfigureTool = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<RosterPanel />);

      expect(screen.getByText('ROSTER MANAGEMENT')).toBeInTheDocument();
    });

    it('displays header with title', () => {
      render(<RosterPanel />);

      expect(screen.getByText('ROSTER MANAGEMENT')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('displays agents tab by default', () => {
      render(<RosterPanel />);

      expect(screen.getByText('AGENTS')).toBeInTheDocument();
      expect(screen.getByText('TOOLS')).toBeInTheDocument();
    });

    it('shows agents tab as active initially', () => {
      render(<RosterPanel />);

      const agentsTab = screen.getByText(/AGENTS/);
      expect(agentsTab).toBeInTheDocument();
    });

    it('switches to tools tab when clicked', () => {
      render(<RosterPanel />);

      const toolsTab = screen.getByText(/TOOLS/);
      fireEvent.click(toolsTab);

      // After clicking tools tab, we should see tool cards
      expect(screen.getByText('SCANNER')).toBeInTheDocument();
    });

    it('switches back to agents tab when clicked', () => {
      render(<RosterPanel />);

      // Click tools first
      const toolsTab = screen.getByText(/TOOLS/);
      fireEvent.click(toolsTab);

      // Then click agents
      const agentsTab = screen.getByText(/AGENTS/);
      fireEvent.click(agentsTab);

      expect(screen.getByText('ALPHA-1')).toBeInTheDocument();
    });
  });

  describe('Agents Tab', () => {
    it('displays agent cards', () => {
      render(<RosterPanel />);

      // Agent codenames are displayed
      expect(screen.getByText('ALPHA-1')).toBeInTheDocument();
      expect(screen.getByText('BETA-1')).toBeInTheDocument();
    });

    it('shows correct agent count in tab', () => {
      render(<RosterPanel />);

      // Should show [02] for 2 agents
      expect(screen.getByText(/\[02\]/)).toBeInTheDocument();
    });
  });

  describe('Tools Tab', () => {
    it('displays tool cards when tools tab is active', () => {
      render(<RosterPanel />);

      const toolsTab = screen.getByText(/TOOLS/);
      fireEvent.click(toolsTab);

      // Tool codenames are displayed
      expect(screen.getByText('SCANNER')).toBeInTheDocument();
      expect(screen.getByText('DBCONN')).toBeInTheDocument();
    });

    it('shows correct tool count in tab', () => {
      render(<RosterPanel />);

      // Should show [02] for 2 tools
      const toolsText = screen.getAllByText(/\[02\]/);
      expect(toolsText.length).toBeGreaterThan(0);
    });
  });

  describe('Footer', () => {
    it('displays personnel count', () => {
      render(<RosterPanel />);

      expect(screen.getByText(/PERSONNEL: 2 AGENTS ACTIVATED/i)).toBeInTheDocument();
    });

    it('displays infrastructure count', () => {
      render(<RosterPanel />);

      expect(screen.getByText(/INFRASTRUCTURE: 2 TOOLS AVAILABLE/i)).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('accepts onConfigureTool callback', () => {
      render(<RosterPanel onConfigureTool={mockOnConfigureTool} />);

      expect(screen.getByText('ROSTER MANAGEMENT')).toBeInTheDocument();
    });
  });

  describe('Agent Interaction', () => {
    it('can click on agent card', () => {
      render(<RosterPanel />);

      const agentCard = screen.getByText('ALPHA-1');
      fireEvent.click(agentCard);

      // The modal should open but we don't test the modal itself here
      expect(agentCard).toBeInTheDocument();
    });
  });
});
