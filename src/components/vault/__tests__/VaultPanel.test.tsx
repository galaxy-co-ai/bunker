// ═══════════════════════════════════════════════════════════════
// BUNKER - VaultPanel Component Tests
// Tests for the secrets vault management panel
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VaultPanel } from '../VaultPanel';
import {
  mockVaultList,
  mockVaultGet,
  mockVaultAdd,
  mockVaultDelete,
  resetAllMocks,
} from '../../../test/mocks/tauri-commands';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((command: string, args?: unknown) => {
    switch (command) {
      case 'vault_list':
        return mockVaultList();
      case 'vault_get':
        return mockVaultGet(args as { name: string });
      case 'vault_add':
        return mockVaultAdd(args);
      case 'vault_delete':
        return mockVaultDelete(args);
      default:
        return Promise.resolve(null);
    }
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('VaultPanel', () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders without crashing', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText('SECRETS VAULT')).toBeInTheDocument();
      });
    });

    it('displays loading state initially', () => {
      render(<VaultPanel />);

      expect(screen.getByText(/DECRYPTING VAULT/i)).toBeInTheDocument();
    });

    it('displays header with add and refresh buttons', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new secret/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh secrets list/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading Secrets', () => {
    it('loads and displays secrets after mount', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(mockVaultList).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
      });
    });

    it('displays error state when loading fails', async () => {
      mockVaultList.mockResolvedValueOnce({
        success: false,
        message: 'Failed to decrypt vault',
        data: null,
      });

      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to decrypt vault/)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('displays empty state when vault is empty', async () => {
      mockVaultList.mockResolvedValueOnce({
        success: true,
        message: 'Found 0 secrets',
        data: [],
      });

      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/VAULT EMPTY/i)).toBeInTheDocument();
      });
    });
  });

  describe('Secret Categories', () => {
    it('groups secrets by category', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/AI Services/i)).toBeInTheDocument();
        expect(screen.getByText(/Database/i)).toBeInTheDocument();
        expect(screen.getByText(/Payments/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    it('filters secrets based on search query', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'OPENAI' } });

      expect(screen.getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
      expect(screen.queryByText(/DATABASE_URL/)).not.toBeInTheDocument();
    });

    it('shows no matches message when search yields no results', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText(/NO MATCHES FOUND/i)).toBeInTheDocument();
    });

    it('clears filters when clear button is clicked', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText(/NO MATCHES FOUND/i)).toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh', () => {
    it('reloads secrets when refresh button is clicked', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(mockVaultList).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByRole('button', { name: /refresh secrets list/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockVaultList).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Stats Footer', () => {
    it('displays correct statistics', async () => {
      render(<VaultPanel />);

      await waitFor(() => {
        expect(screen.getByText(/TOTAL: 3 CREDENTIALS/i)).toBeInTheDocument();
        expect(screen.getByText(/STATUS: ENCRYPTED/i)).toBeInTheDocument();
      });
    });
  });
});
