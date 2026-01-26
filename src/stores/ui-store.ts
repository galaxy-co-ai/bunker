import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  contextPanelOpen: boolean;
  contextPanelWidth: number;
  setSidebarOpen: (open: boolean) => void;
  setContextPanelOpen: (open: boolean) => void;
  setContextPanelWidth: (width: number) => void;
  toggleSidebar: () => void;
  toggleContextPanel: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      contextPanelOpen: true,
      contextPanelWidth: 320,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setContextPanelOpen: (open) => set({ contextPanelOpen: open }),
      setContextPanelWidth: (width) => set({ contextPanelWidth: width }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleContextPanel: () =>
        set((state) => ({ contextPanelOpen: !state.contextPanelOpen })),
    }),
    {
      name: "bunker-ui-store",
    }
  )
);
