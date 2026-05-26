// Infrastructure: UI Store (Zustand)
// UI state only — sidebar, panels, modals, theme

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppMode } from '../../domain/entities/AppMode';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  
  // Multi-panel tabs
  activePanelTab: 'file' | 'debug' | 'diff' | 'ai';
  
  // App mode (domain切面)
  appMode: AppMode;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanelTab: (tab: UIState['activePanelTab']) => void;
  setAppMode: (mode: AppMode) => void;
  setTheme: (theme: UIState['theme']) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activePanelTab: 'file',
      appMode: 'general',
      theme: 'system',
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActivePanelTab: (tab) => set({ activePanelTab: tab }),
      setAppMode: (mode) => set({ appMode: mode }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'aiim-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        appMode: state.appMode,
        theme: state.theme,
      }),
    }
  )
);
