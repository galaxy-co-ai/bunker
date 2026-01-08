// ═══════════════════════════════════════════════════════════════
// BUNKER - ConsolePanel Component Tests
// Tests for the main console panel with system monitoring
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConsolePanel } from '../ConsolePanel';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  },
}));

// Mock react-resizable-panels
vi.mock('react-resizable-panels', () => ({
  Panel: ({ children }: { children?: React.ReactNode }) => <div data-testid="panel">{children}</div>,
  Group: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="panel-group" className={className}>
      {children}
    </div>
  ),
  Separator: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="separator" className={className}>
      {children}
    </div>
  ),
}));

// Mock the sub-components to isolate testing
vi.mock('../SystemMonitor', () => ({
  SystemMonitor: () => <div data-testid="system-monitor">System Monitor</div>,
}));

vi.mock('../TerminalSection', () => ({
  TerminalSection: () => <div data-testid="terminal-section">Terminal Section</div>,
}));

vi.mock('../ProcessList', () => ({
  ProcessList: () => <div data-testid="process-list">Process List</div>,
}));

vi.mock('../EnvironmentInfo', () => ({
  EnvironmentInfo: () => <div data-testid="environment-info">Environment Info</div>,
}));

vi.mock('../ConsoleOperationsLog', () => ({
  ConsoleOperationsLog: () => <div data-testid="operations-log">Operations Log</div>,
}));

describe('ConsolePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ConsolePanel />);

      // The component should render the panel groups
      expect(screen.getAllByTestId('panel-group').length).toBeGreaterThan(0);
    });

    it('renders all resizable panels', () => {
      render(<ConsolePanel />);

      const panels = screen.getAllByTestId('panel');
      expect(panels.length).toBeGreaterThan(0);
    });

    it('renders separators between panels', () => {
      render(<ConsolePanel />);

      const separators = screen.getAllByTestId('separator');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  describe('Sub-components', () => {
    it('includes SystemMonitor component', () => {
      render(<ConsolePanel />);

      expect(screen.getByTestId('system-monitor')).toBeInTheDocument();
    });

    it('includes TerminalSection component', () => {
      render(<ConsolePanel />);

      expect(screen.getByTestId('terminal-section')).toBeInTheDocument();
    });

    it('includes ProcessList component', () => {
      render(<ConsolePanel />);

      expect(screen.getByTestId('process-list')).toBeInTheDocument();
    });

    it('includes EnvironmentInfo component', () => {
      render(<ConsolePanel />);

      expect(screen.getByTestId('environment-info')).toBeInTheDocument();
    });

    it('includes ConsoleOperationsLog component', () => {
      render(<ConsolePanel />);

      expect(screen.getByTestId('operations-log')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('has horizontal panel group as root', () => {
      render(<ConsolePanel />);

      const panelGroups = screen.getAllByTestId('panel-group');
      expect(panelGroups[0]).toBeInTheDocument();
    });

    it('contains multiple nested panel groups for vertical layouts', () => {
      render(<ConsolePanel />);

      const panelGroups = screen.getAllByTestId('panel-group');
      // Should have main horizontal group plus nested vertical groups
      expect(panelGroups.length).toBeGreaterThan(1);
    });
  });

  describe('Component Integration', () => {
    it('renders all five main sections', () => {
      render(<ConsolePanel />);

      // Verify all five main sections are present
      expect(screen.getByText('System Monitor')).toBeInTheDocument();
      expect(screen.getByText('Terminal Section')).toBeInTheDocument();
      expect(screen.getByText('Process List')).toBeInTheDocument();
      expect(screen.getByText('Environment Info')).toBeInTheDocument();
      expect(screen.getByText('Operations Log')).toBeInTheDocument();
    });
  });

  describe('Panel Configuration', () => {
    it('creates correct number of panels', () => {
      render(<ConsolePanel />);

      const panels = screen.getAllByTestId('panel');
      // Should have panels for each section
      expect(panels.length).toBeGreaterThanOrEqual(5);
    });
  });
});
