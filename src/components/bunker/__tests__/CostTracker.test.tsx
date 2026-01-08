// ═══════════════════════════════════════════════════════════════
// BUNKER - CostTracker Component Tests
// Tests for the cost tracking and savings display panel
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostTracker } from '../CostTracker';
import { createMockCostMetrics } from '../../../test/test-utils';
import type { CostTrackerProps } from '../../../lib/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  },
}));

describe('CostTracker', () => {
  const defaultMetrics = createMockCostMetrics();

  const defaultCloudCostSummary = {
    total_cost: 0.15,
    total_tasks: 5,
    providers: [
      {
        provider: 'claude',
        total_cost: 0.10,
        api_tasks: 3,
        browser_tasks: 1,
      },
      {
        provider: 'openai',
        total_cost: 0.05,
        api_tasks: 1,
        browser_tasks: 0,
      },
    ],
  };

  const defaultProps: CostTrackerProps = {
    metrics: defaultMetrics,
    cloudCostSummary: defaultCloudCostSummary,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('RESOURCE EXPENDITURE')).toBeInTheDocument();
    });

    it('displays header', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('RESOURCE EXPENDITURE')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no data', () => {
      const emptyMetrics = createMockCostMetrics({
        today: 0,
        week: 0,
        month: 0,
        totalSaved: 0,
      });

      render(<CostTracker metrics={emptyMetrics} cloudCostSummary={null} />);

      expect(screen.getByText(/AWAITING DATA/i)).toBeInTheDocument();
    });

    it('displays $0.00 in empty state', () => {
      const emptyMetrics = createMockCostMetrics({
        today: 0,
        week: 0,
        month: 0,
        totalSaved: 0,
      });

      render(<CostTracker metrics={emptyMetrics} cloudCostSummary={null} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Cloud Provider Costs', () => {
    it('displays cloud API costs section when data available', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('CLOUD API COSTS')).toBeInTheDocument();
    });

    it('shows provider cost breakdown', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('CLAUDE')).toBeInTheDocument();
    });

    it('displays total cloud cost', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('TOTAL CLOUD:')).toBeInTheDocument();
    });

    it('shows task count', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText(/5 tasks processed/i)).toBeInTheDocument();
    });

    it('displays browser task count when available', () => {
      render(<CostTracker {...defaultProps} />);

      // Claude has 1 browser task
      expect(screen.getByText(/BROWSER: 1 FREE/i)).toBeInTheDocument();
    });
  });

  describe('Local Savings', () => {
    it('displays local savings section when data available', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('LOCAL SAVINGS')).toBeInTheDocument();
    });

    it('shows today metrics', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('TODAY:')).toBeInTheDocument();
      expect(screen.getByText('$0.50')).toBeInTheDocument();
    });

    it('shows week metrics', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('THIS WEEK:')).toBeInTheDocument();
      expect(screen.getByText('$3.50')).toBeInTheDocument();
    });

    it('shows month metrics', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('THIS MONTH:')).toBeInTheDocument();
      expect(screen.getByText('$15.00')).toBeInTheDocument();
    });

    it('shows total saved amount', () => {
      render(<CostTracker {...defaultProps} />);

      expect(screen.getByText('$45.00')).toBeInTheDocument();
      expect(screen.getByText('TOTAL SECURED')).toBeInTheDocument();
    });

    it('shows savings percentage', () => {
      render(<CostTracker {...defaultProps} />);

      // todayVsCloud is 85%
      expect(screen.getByText(/▼ -85%/)).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('only shows cloud costs when cloud data exists', () => {
      const noCloudProps: CostTrackerProps = {
        metrics: defaultMetrics,
        cloudCostSummary: null,
      };

      render(<CostTracker {...noCloudProps} />);

      expect(screen.queryByText('CLOUD API COSTS')).not.toBeInTheDocument();
      expect(screen.getByText('LOCAL SAVINGS')).toBeInTheDocument();
    });

    it('only shows local savings when local data exists', () => {
      const onlyCloudProps: CostTrackerProps = {
        metrics: createMockCostMetrics({
          today: 0,
          week: 0,
          month: 0,
          totalSaved: 0,
        }),
        cloudCostSummary: defaultCloudCostSummary,
      };

      render(<CostTracker {...onlyCloudProps} />);

      expect(screen.getByText('CLOUD API COSTS')).toBeInTheDocument();
      expect(screen.queryByText('LOCAL SAVINGS')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very large numbers', () => {
      const largeMetrics = createMockCostMetrics({
        totalSaved: 99999.99,
      });

      render(<CostTracker metrics={largeMetrics} cloudCostSummary={defaultCloudCostSummary} />);

      expect(screen.getByText('$99999.99')).toBeInTheDocument();
    });

    it('handles zero cloud cost', () => {
      const zeroCloudCost = {
        total_cost: 0,
        total_tasks: 0,
        providers: [],
      };

      render(<CostTracker metrics={createMockCostMetrics({ today: 1 })} cloudCostSummary={zeroCloudCost} />);

      // Should still render without errors
      expect(screen.getByText('RESOURCE EXPENDITURE')).toBeInTheDocument();
    });

    it('handles missing provider info gracefully', () => {
      const unknownProvider = {
        total_cost: 0.10,
        total_tasks: 1,
        providers: [
          {
            provider: 'unknown_provider',
            total_cost: 0.10,
            api_tasks: 1,
            browser_tasks: 0,
          },
        ],
      };

      render(<CostTracker metrics={defaultMetrics} cloudCostSummary={unknownProvider} />);

      // Should render without crashing
      expect(screen.getByText('RESOURCE EXPENDITURE')).toBeInTheDocument();
    });
  });
});
