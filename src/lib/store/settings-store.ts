// BUNKER Settings Store
// Zustand state management for app settings and API keys

import { create } from 'zustand';
import { apiKeys, claude } from '../services/tauri-bridge';

export interface ApiKeyStatus {
  name: string;
  displayName: string;
  isSet: boolean;
  isConnected: boolean;
}

interface SettingsStore {
  // State
  apiKeyStatuses: ApiKeyStatus[];
  isLoading: boolean;
  error: string | null;
  settingsOpen: boolean;

  // Actions
  refreshApiKeyStatuses: () => Promise<void>;
  setApiKey: (name: string, value: string) => Promise<boolean>;
  removeApiKey: (name: string) => Promise<boolean>;
  openSettings: () => void;
  closeSettings: () => void;
  clearError: () => void;
}

// Supported API keys
const SUPPORTED_KEYS: { name: string; displayName: string }[] = [
  { name: 'ANTHROPIC_API_KEY', displayName: 'Claude (Anthropic)' },
  { name: 'OPENAI_API_KEY', displayName: 'OpenAI' },
  { name: 'PERPLEXITY_API_KEY', displayName: 'Perplexity' },
  { name: 'GEMINI_API_KEY', displayName: 'Gemini (Google)' },
];

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  apiKeyStatuses: SUPPORTED_KEYS.map((k) => ({
    ...k,
    isSet: false,
    isConnected: false,
  })),
  isLoading: false,
  error: null,
  settingsOpen: false,

  // Refresh API key statuses
  refreshApiKeyStatuses: async () => {
    set({ isLoading: true, error: null });

    try {
      const statuses = await Promise.all(
        SUPPORTED_KEYS.map(async (key) => {
          const isSet = await apiKeys.check(key.name);
          let isConnected = false;

          // Check connection for Anthropic
          if (key.name === 'ANTHROPIC_API_KEY' && isSet) {
            try {
              isConnected = await claude.checkConnection();
            } catch {
              isConnected = false;
            }
          }

          return {
            name: key.name,
            displayName: key.displayName,
            isSet,
            isConnected,
          };
        })
      );

      set({ apiKeyStatuses: statuses, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // Set an API key
  setApiKey: async (name: string, value: string) => {
    try {
      await apiKeys.set(name, value);
      await get().refreshApiKeyStatuses();
      return true;
    } catch (error) {
      set({ error: String(error) });
      return false;
    }
  },

  // Remove an API key
  removeApiKey: async (name: string) => {
    try {
      await apiKeys.remove(name);
      await get().refreshApiKeyStatuses();
      return true;
    } catch (error) {
      set({ error: String(error) });
      return false;
    }
  },

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  clearError: () => set({ error: null }),
}));
