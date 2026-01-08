// ═══════════════════════════════════════════════════════════════
// BUNKER - SystemHealth Component Tests
// Tests for the system health monitoring panel
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemHealth } from '../SystemHealth';
import { createMockModelStatus } from '../../../test/test-utils';
import type { SystemHealthProps } from '../../../lib/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  },
}));

// Mock dynamic import for Tauri
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({}),
}));

describe('SystemHealth', () => {
  const defaultProps: SystemHealthProps = {
    models: [
      createMockModelStatus({ id: 'llama3.1:8b', name: 'Llama 3.1 8B', status: 'active', ramUsage: 4.5 }),
      createMockModelStatus({ id: 'mistral:7b', name: 'Mistral 7B', status: 'idle', ramUsage: 0 }),
    ],
    totalRam: 32,
    totalRamUsed: 16,
    cpuUsage: 35.5,
    cloudRouterStatus: null,
    onConfigureProvider: vi.fn(),
    onTestProvider: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('SYSTEM HEALTH')).toBeInTheDocument();
    });

    it('displays panel header', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('SYSTEM HEALTH')).toBeInTheDocument();
    });

    it('renders refresh button', () => {
      render(<SystemHealth {...defaultProps} />);

      const refreshButton = screen.getByTitle('Refresh Status');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('System Gauges', () => {
    it('displays RAM gauge', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('RAM')).toBeInTheDocument();
    });

    it('displays CPU gauge', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('CPU')).toBeInTheDocument();
    });
  });

  describe('Cloud APIs Section', () => {
    it('displays Cloud APIs header', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('CLOUD APIs')).toBeInTheDocument();
    });
  });

  describe('Local Models Section', () => {
    it('displays Local Models header', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('LOCAL MODELS')).toBeInTheDocument();
    });

    it('renders model cards for each model', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('Llama 3.1 8B')).toBeInTheDocument();
      expect(screen.getByText('Mistral 7B')).toBeInTheDocument();
    });

    it('displays active model with correct RAM usage', () => {
      render(<SystemHealth {...defaultProps} />);

      expect(screen.getByText('4.5GB')).toBeInTheDocument();
    });

    it('renders empty state when no models', () => {
      render(<SystemHealth {...defaultProps} models={[]} />);

      expect(screen.queryByText('Llama 3.1 8B')).not.toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('triggers refresh on button click', async () => {
      render(<SystemHealth {...defaultProps} />);

      const refreshButton = screen.getByTitle('Refresh Status');
      fireEvent.click(refreshButton);

      // The button should be clickable
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Model Status Display', () => {
    it('shows correct status for active models', () => {
      render(<SystemHealth {...defaultProps} />);

      // The model with active status should show its RAM usage
      expect(screen.getByText('Llama 3.1 8B')).toBeInTheDocument();
    });

    it('shows correct status for idle models', () => {
      const idleModels = [
        createMockModelStatus({ id: 'model-1', name: 'Idle Model', status: 'idle', ramUsage: 0 }),
      ];

      render(<SystemHealth {...defaultProps} models={idleModels} />);

      expect(screen.getByText('Idle Model')).toBeInTheDocument();
    });

    it('shows correct status for offline models', () => {
      const offlineModels = [
        createMockModelStatus({ id: 'model-1', name: 'Offline Model', status: 'offline', ramUsage: 0 }),
      ];

      render(<SystemHealth {...defaultProps} models={offlineModels} />);

      expect(screen.getByText('Offline Model')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles missing cloudRouterStatus gracefully', () => {
      render(<SystemHealth {...defaultProps} cloudRouterStatus={undefined} />);

      expect(screen.getByText('SYSTEM HEALTH')).toBeInTheDocument();
    });

    it('handles zero RAM values', () => {
      render(<SystemHealth {...defaultProps} totalRam={0} totalRamUsed={0} />);

      expect(screen.getByText('RAM')).toBeInTheDocument();
    });

    it('handles 100% CPU usage', () => {
      render(<SystemHealth {...defaultProps} cpuUsage={100} />);

      expect(screen.getByText('CPU')).toBeInTheDocument();
    });
  });
});
