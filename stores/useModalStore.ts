import { create } from "zustand";
import React from "react";

interface ModalOptions {
  content: React.ReactNode;
  snapPoints?: string[];
}

interface ModalStore {
  config: ModalOptions | null;
  isOpen: boolean;
  showModal: (config: ModalOptions) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  config: null,
  isOpen: false,
  showModal: (config) => set({ config, isOpen: true }),
  hideModal: () => set({ isOpen: false, config: null }),
}));
