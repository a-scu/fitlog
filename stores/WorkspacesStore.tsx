import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Workspace } from "@/types/Workspace";

interface WorkspacesStore {
  workspaces: Workspace[];

  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
}

export const useWorkspacesStore = create<WorkspacesStore>()(
  persist(
    (set) => ({
      workspaces: [],

      setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
      addWorkspace: (workspace: Workspace) => set((state) => ({ workspaces: [...state.workspaces, workspace] })),
      removeWorkspace: (workspaceId: string) =>
        set((state) => ({ workspaces: state.workspaces.filter((workspace) => workspace.id !== workspaceId) })),
    }),
    {
      name: "workspaces",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
