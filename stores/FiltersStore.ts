import { create } from "zustand";

interface FiltersState {
  bodyParts: string;
  equipments: string;
  muscles: string;
  search: string;
  expandedFilter: string | null;
  showFilters: boolean;
  setField: (field: keyof Omit<FiltersState, "expandedFilter" | "setField" | "setExpandedFilter" | "resetFilters" | "showFilters" | "setShowFilters">, value: string) => void;
  setExpandedFilter: (expandedFilter: string | null) => void;
  setShowFilters: (showFilters: boolean) => void;
  resetFilters: () => void;
}

export const useFilters = create<FiltersState>((set) => ({
  bodyParts: "",
  equipments: "",
  muscles: "",
  search: "",
  expandedFilter: null,
  showFilters: false,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setExpandedFilter: (expandedFilter) => set({ expandedFilter }),
  setShowFilters: (showFilters) => set({ showFilters }),
  resetFilters: () =>
    set({
      expandedFilter: null,
      showFilters: false,
      bodyParts: "",
      equipments: "",
      muscles: "",
      search: "",
    }),
}));
