import { create } from "zustand";

interface MegaMenuState {
  activeTab: string | null;
  isPanelOpen: boolean;
  setActiveTab: (tab: string | null) => void;
  setPanelOpen: (isOpen: boolean) => void;
  closeMenu: () => void;
}

export const useMegaMenu = create<MegaMenuState>((set) => ({
  activeTab: null,
  isPanelOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  closeMenu: () => set({ activeTab: null, isPanelOpen: false }),
}));
