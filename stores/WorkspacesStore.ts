import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Workspace } from "@/types/Workspace";

interface WorkspacesStore {
  personalWorkspaceId: string;
  workspaces: Workspace[];

  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, field: keyof Workspace, value: any) => void;
  deleteWorkspace: (workspaceId: string) => void;
  deleteAllWorkspaces: () => void;
  getPersonalWorkspace: () => Workspace | undefined;
}

export const useWorkspacesStore = create<WorkspacesStore>()(
  persist(
    (set, get) => ({
      personalWorkspaceId: "default",
      workspaces: [
        {
          id: "default",
          name: "Yo",
          routineId: "",
          notes: [],
          createdAt: "",
          athleteId: null,
          isShared: false,
          coachId: null,
        },
      ],

      setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),

      addWorkspace: (workspace: Workspace) => set((state) => ({ workspaces: [workspace, ...state.workspaces] })),

      updateWorkspace: (workspaceId: string, field: keyof Workspace, value: any) =>
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId ? { ...workspace, [field]: value } : workspace,
          ),
        })),

      deleteWorkspace: (workspaceId: string) =>
        set((state) => ({ workspaces: state.workspaces.filter((workspace) => workspace.id !== workspaceId) })),

      deleteAllWorkspaces: () =>
        set(({ workspaces }) => ({ workspaces: workspaces.filter((w) => w.id === "default") })),

      getPersonalWorkspace: () => {
        const { workspaces, personalWorkspaceId } = get();
        return workspaces.find((w) => w.id === personalWorkspaceId);
      },
    }),

    {
      name: "workspaces",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
