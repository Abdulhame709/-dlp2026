import { create } from 'zustand';

interface LayoutState {
  isSidebarCollapsed: boolean;
  activeWorkspaceId: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveWorkspaceId: (id: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarCollapsed: false,
  activeWorkspaceId: '', // Resolved dynamically from user's organization membership
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
}));
