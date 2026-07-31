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
  activeWorkspaceId: '22222222-2222-2222-2222-222222222222', // Seed organization default org ID
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
}));
