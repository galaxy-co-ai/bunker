import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  contextPanelOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setContextPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleContextPanel: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      contextPanelOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setContextPanelOpen: (open) => set({ contextPanelOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleContextPanel: () =>
        set((state) => ({ contextPanelOpen: !state.contextPanelOpen })),
    }),
    {
      name: "bunker-ui-store",
    }
  )
);
