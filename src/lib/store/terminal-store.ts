// BUNKER Terminal Store
// Zustand state management for terminal sessions

import { create } from 'zustand';
import type { TerminalSession } from '../types/terminal';
import { terminal } from '../services/tauri-bridge';

interface TerminalStore {
  // State
  sessions: TerminalSession[];
  activeSessionId: string | null;
  error: string | null;

  // Actions
  createSession: (title?: string) => Promise<string | null>;
  closeSession: (id: string) => Promise<void>;
  setActiveSession: (id: string | null) => void;
  renameSession: (id: string, title: string) => void;
  clearError: () => void;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  // Initial state
  sessions: [],
  activeSessionId: null,
  error: null,

  // Create a new terminal session
  createSession: async (title?: string) => {
    try {
      const id = await terminal.create();
      const session: TerminalSession = {
        id,
        title: title ?? `Terminal ${get().sessions.length + 1}`,
        createdAt: new Date(),
      };

      set((state) => ({
        sessions: [...state.sessions, session],
        activeSessionId: id,
        error: null,
      }));

      // Listen for session close
      terminal.onClose(id, () => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          activeSessionId:
            state.activeSessionId === id
              ? state.sessions.find((s) => s.id !== id)?.id ?? null
              : state.activeSessionId,
        }));
      });

      return id;
    } catch (error) {
      set({ error: String(error) });
      return null;
    }
  },

  // Close a terminal session
  closeSession: async (id: string) => {
    try {
      await terminal.close(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        activeSessionId:
          state.activeSessionId === id
            ? state.sessions.find((s) => s.id !== id)?.id ?? null
            : state.activeSessionId,
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  renameSession: (id, title) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, title } : s
      ),
    })),

  clearError: () => set({ error: null }),
}));
