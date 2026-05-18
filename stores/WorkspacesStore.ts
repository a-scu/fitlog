import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { PersonalWorkspace, Workspace } from "@/types/Workspace";
import { useUserStore } from "./UserStore";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "@react-native-firebase/firestore";

import { Alert } from "react-native";

interface WorkspacesStore {
  personalWorkspace: PersonalWorkspace;
  workspaces: Workspace[];

  updatePersonalWorkspace: (personalWorkspace: PersonalWorkspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (
    workspaceId: string,
    field: keyof Workspace,
    value: any,
  ) => void;
  deleteWorkspace: (workspaceId: string) => void;
  deleteAllWorkspaces: () => void;

  generateInviteLink: (workspaceId: string) => Promise<string | null>;
  acceptInvitation: (workspaceId: string) => Promise<void>;
  syncWorkspaceToFirestore: (workspace: Workspace) => Promise<void>;
  updateWorkspaceFull: (workspace: Workspace) => void;
  fetchWorkspace: (workspaceId: string) => Promise<void>;
}

export const useWorkspacesStore = create<WorkspacesStore>()(
  persist(
    (set, get) => ({
      personalWorkspace: {
        id: "personal",
        name: "Yo",
        routineId: "",
        notes: [],
        createdAt: "",
      },
      workspaces: [],

      updatePersonalWorkspace: (personalWorkspace: PersonalWorkspace) => {
        set((state) => ({ personalWorkspace }));
      },

      setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),

      addWorkspace: (workspace: Workspace) =>
        set((state) => ({ workspaces: [workspace, ...state.workspaces] })),

      updateWorkspace: (
        workspaceId: string,
        field: keyof Workspace,
        value: any,
      ) => {
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId
              ? { ...workspace, [field]: value }
              : workspace,
          ),
        }));

        // If it's a shared workspace, sync the update to Firestore
        const updatedWorkspace = get().workspaces.find(
          (w) => w.id === workspaceId,
        );
        if (updatedWorkspace?.isShared) {
          get().syncWorkspaceToFirestore(updatedWorkspace);
        }
      },

      updateWorkspaceFull: (updatedWorkspace: Workspace) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === updatedWorkspace.id ? updatedWorkspace : w,
          ),
        }));
      },

      deleteWorkspace: (workspaceId: string) =>
        set((state) => ({
          workspaces: state.workspaces.filter(
            (workspace) => workspace.id !== workspaceId,
          ),
        })),

      deleteAllWorkspaces: () =>
        set(({ workspaces }) => ({
          workspaces: workspaces.filter((w) => w.id === "default"),
        })),

      syncWorkspaceToFirestore: async (workspace: Workspace) => {
        try {
          const workspaceToSync = { ...workspace, isShared: true };
          await setDoc(
            doc(getFirestore(), "workspaces", workspace.id),
            workspaceToSync,
            { merge: true },
          );
        } catch (error) {
          console.error("Error syncing workspace to Firestore:", error);
        }
      },

      generateInviteLink: async (workspaceId: string) => {
        const currentUser = useUserStore.getState().user;
        if (!currentUser) {
          Alert.alert("Error", "Debes iniciar sesión para invitar a alguien.");
          return null;
        }

        const workspace = get().workspaces.find((w) => w.id === workspaceId);
        if (!workspace) return null;

        if (workspace.id === "default") {
          Alert.alert(
            "Error",
            "No puedes invitar a otros a tu workspace personal.",
          );
          return null;
        }

        if (workspace.athleteId) {
          Alert.alert("Error", "Este workspace ya tiene un atleta registrado.");
          return null;
        }

        try {
          // Sync workspace to firestore to make it available
          const workspaceToSync = {
            ...workspace,
            isShared: true,
            coachId: currentUser.uid,
            coachName:
              currentUser.displayName ||
              currentUser.username ||
              "Un entrenador",
          };
          await get().syncWorkspaceToFirestore(workspaceToSync);

          // Update local workspace as well
          get().updateWorkspaceFull(workspaceToSync);

          const link = `https://fitlog-4c7db.web.app/invite?id=${workspaceId}`;
          return link;
        } catch (error) {
          console.error("Error generating invite:", error);
          Alert.alert("Error", "No se pudo generar la invitación.");
          return null;
        }
      },

      acceptInvitation: async (workspaceId: string) => {
        const currentUser = useUserStore.getState().user;
        if (!currentUser)
          throw new Error("Debes iniciar sesión para aceptar una invitación.");

        try {
          const wsRef = doc(getFirestore(), "workspaces", workspaceId);
          const wsSnap = await getDoc(wsRef);

          if (!wsSnap.exists) throw new Error("El workspace no existe.");
          const workspaceData = wsSnap.data() as Workspace;

          if (
            workspaceData.athleteId &&
            workspaceData.athleteId !== currentUser.uid
          ) {
            throw new Error("Este workspace ya tiene un atleta.");
          }

          // Update workspace with new athlete
          const athleteName =
            currentUser.displayName || currentUser.username || "Un alumno";
          await updateDoc(wsRef, { athleteId: currentUser.uid, athleteName });

          // Save to local store
          const newWorkspace = {
            ...workspaceData,
            athleteId: currentUser.uid,
            athleteName,
          };

          // Use update if it exists, otherwise add
          const exists = get().workspaces.find((w) => w.id === newWorkspace.id);
          if (exists) {
            get().updateWorkspaceFull(newWorkspace);
          } else {
            get().addWorkspace(newWorkspace);
          }

          // Fetch routine if the workspace has one
          if (workspaceData.routineId) {
            const routineRef = doc(
              getFirestore(),
              "routines",
              workspaceData.routineId,
            );
            const routineSnap = await getDoc(routineRef);
            if (routineSnap.exists) {
              const { useRoutinesStore } = require("@/stores/RoutinesStore");
              useRoutinesStore.getState().addRoutine(routineSnap.data() as any);
            }
          }
        } catch (error) {
          console.error("Error accepting invitation:", error);
          throw error;
        }
      },

      fetchWorkspace: async (workspaceId: string) => {
        try {
          const wsRef = doc(getFirestore(), "workspaces", workspaceId);
          const wsSnap = await getDoc(wsRef);

          if (wsSnap.exists) {
            const workspaceData = wsSnap.data() as Workspace;
            get().updateWorkspaceFull(workspaceData);

            // Also refresh routine if it changed
            if (workspaceData.routineId) {
              const routineRef = doc(
                getFirestore(),
                "routines",
                workspaceData.routineId,
              );
              const routineSnap = await getDoc(routineRef);
              if (routineSnap.exists) {
                const { useRoutinesStore } = require("@/stores/RoutinesStore");
                useRoutinesStore
                  .getState()
                  .addRoutine(routineSnap.data() as any);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching workspace:", error);
        }
      },
    }),

    {
      name: "workspaces",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
