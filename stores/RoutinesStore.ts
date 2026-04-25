import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Routine, Set, Rest, Metric, PartialReps } from "@/types/Routine";
import { randomId } from "@/utils/random";

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultMetric = (value = ""): Metric => ({
  value,
  min: "",
  max: "",
  isRange: false,
});

const defaultPartialReps = (): PartialReps => ({
  isRange: false,
  value: "",
  min: "",
  max: "",
  rom: "",
  customRom: "",
});

// ── Store interface ───────────────────────────────────────────────────────────

interface RoutinesStore {
  routines: Routine[];
  editingRoutineId: string | null;

  setRoutines: (routines: Routine[]) => void;
  setEditingRoutineId: (id: string | null) => void;

  // Acciones de Rutina
  updateRoutineName: (name: string) => void;
  deleteRoutine: (routineId?: string) => void;

  // Acciones de Pasos (Sets/Descansos)
  addSet: (exerciseId: string, setConfig?: { weight?: string; reps?: string; rir?: string }) => void;
  addRest: () => void;
  updateRestDuration: (stepId: string, duration: number) => void;
  deleteStep: (stepId: string) => void;
  updateSetField: (setId: string, field: string, value: any) => void;

  // Acciones de DropSets
  toggleDropSets: (setId: string) => void;
  addDropSet: (setId: string) => void;
  deleteDropSet: (setId: string, dropSetId: string) => void;
  updateDropSetField: (setId: string, dropSetId: string, field: string, value: any) => void;

  // Acciones de Metric (weight/reps/rir) para Set y DropSet
  updateMetricField: (setId: string, metric: "weight" | "reps" | "rir", field: keyof Metric, value: any) => void;
  updateDropSetMetricField: (
    setId: string,
    dropSetId: string,
    metric: "weight" | "reps" | "rir",
    field: keyof Metric,
    value: any,
  ) => void;

  // Acciones de PartialReps
  updatePartialRepsField: (setId: string, field: keyof PartialReps, value: any) => void;
  updateDropSetPartialRepsField: (setId: string, dropSetId: string, field: keyof PartialReps, value: any) => void;
  deletePartialReps: (setId: string, dropSetId?: string) => void;

  // Acciones de Notes
  toggleNotes: (setId: string) => void;
  updateNotes: (setId: string, note: string) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useRoutinesStore = create<RoutinesStore>()(
  persist(
    (set) => ({
      routines: [],
      editingRoutineId: null,

      setRoutines: (routines) => set({ routines }),
      setEditingRoutineId: (id) => set({ editingRoutineId: id }),

      updateRoutineName: (name) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === state.editingRoutineId ? { ...r, name } : r)),
        })),

      deleteRoutine: (routineId?: string) =>
        set((state) => ({
          routines: state.routines.filter((r) =>
            state.editingRoutineId ? r.id !== state.editingRoutineId : r.id !== routineId,
          ),
        })),

      addSet: (exerciseId, { weight, reps, rir } = {}) =>
        set((state) => {
          if (!state.editingRoutineId) return state;
          const newId = randomId();
          return {
            routines: state.routines.map((r) => {
              if (r.id !== state.editingRoutineId) return r;
              const lastSet = [...r.steps].reverse().find((s) => s.type !== "rest" && s.exerciseId === exerciseId) as
                | Set
                | undefined;
              const newSet: Set = {
                id: newId,
                weight: defaultMetric(weight ?? lastSet?.weight.value ?? ""),
                reps: defaultMetric(reps ?? lastSet?.reps.value ?? ""),
                rir: defaultMetric(rir ?? lastSet?.rir.value ?? ""),
                exerciseId,
                type: lastSet?.type ?? "effective",
                dropSets: [],
                partialReps: defaultPartialReps(),
                notes: { enabled: false, text: "" },
              };
              return { ...r, steps: [...r.steps, newSet] };
            }),
          };
        }),

      addRest: () =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === state.editingRoutineId
              ? { ...r, steps: [...r.steps, { id: randomId(), type: "rest", duration: 60 }] }
              : r,
          ),
        })),

      updateRestDuration: (stepId, duration) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === state.editingRoutineId
              ? {
                  ...r,
                  steps: r.steps.map((s) => (s.id === stepId && s.type === "rest" ? { ...s, duration } : s)),
                }
              : r,
          ),
        })),

      deleteStep: (stepId) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === state.editingRoutineId
              ? {
                  ...r,
                  steps: r.steps.filter((s) => s.id !== stepId),
                }
              : r,
          ),
        })),

      updateSetField: (setId, field, value) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === state.editingRoutineId
              ? {
                  ...r,
                  steps: r.steps.map((s) => (s.id === setId && s.type !== "rest" ? { ...s, [field]: value } : s)),
                }
              : r,
          ),
        })),

      // ── Metric helpers ────────────────────────────────────────────────────

      updateMetricField: (setId, metric, field, value) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === state.editingRoutineId
              ? {
                  ...r,
                  steps: r.steps.map((s) =>
                    s.id === setId && s.type !== "rest" ? { ...s, [metric]: { ...s[metric], [field]: value } } : s,
                  ),
                }
              : r,
          ),
        })),

      updateDropSetMetricField: (setId, dropSetId, metric, field, value) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === state.editingRoutineId
              ? {
                  ...r,
                  steps: r.steps.map((s) => {
                    if (s.id !== setId || s.type === "rest") return s;
                    return {
                      ...s,
                      dropSets: s.dropSets.map((ds) =>
                        ds.id === dropSetId ? { ...ds, [metric]: { ...ds[metric], [field]: value } } : ds,
                      ),
                    };
                  }),
                }
              : r,
          ),
        })),

      // ── DropSet actions ───────────────────────────────────────────────────

      toggleDropSets: (setId) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                if (s.dropSets && s.dropSets.length > 0) {
                  return { ...s, dropSets: s.dropSets.slice(0, -1) };
                }
                return {
                  ...s,
                  dropSets: [
                    {
                      id: randomId(),
                      weight: { ...s.weight },
                      reps: { ...s.reps },
                      rir: { ...s.rir },
                      partialReps: defaultPartialReps(),
                    },
                  ],
                };
              }),
            };
          }),
        })),

      addDropSet: (setId) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                const lastDs = s.dropSets && s.dropSets.length > 0 ? s.dropSets[s.dropSets.length - 1] : s;
                const newDropSet = {
                  id: randomId(),
                  weight: { ...lastDs.weight },
                  reps: { ...lastDs.reps },
                  rir: { ...lastDs.rir },
                  partialReps: defaultPartialReps(),
                };
                return { ...s, dropSets: [...(s.dropSets || []), newDropSet] };
              }),
            };
          }),
        })),

      deleteDropSet: (setId, dropSetId) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                return { ...s, dropSets: s.dropSets.filter((ds) => ds.id !== dropSetId) };
              }),
            };
          }),
        })),

      updateDropSetField: (setId, dropSetId, field, value) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                return {
                  ...s,
                  dropSets: s.dropSets.map((ds) => (ds.id === dropSetId ? { ...ds, [field]: value } : ds)),
                };
              }),
            };
          }),
        })),

      // ── PartialReps actions ───────────────────────────────────────────────

      updatePartialRepsField: (setId, field, value) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                return { ...s, partialReps: { ...s.partialReps, [field]: value } };
              }),
            };
          }),
        })),

      updateDropSetPartialRepsField: (setId, dropSetId, field, value) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                return {
                  ...s,
                  dropSets: s.dropSets.map((ds) =>
                    ds.id === dropSetId ? { ...ds, partialReps: { ...ds.partialReps, [field]: value } } : ds,
                  ),
                };
              }),
            };
          }),
        })),

      deletePartialReps: (setId, dropSetId) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                if (dropSetId) {
                  return {
                    ...s,
                    dropSets: s.dropSets.map((ds) =>
                      ds.id === dropSetId ? { ...ds, partialReps: defaultPartialReps() } : ds,
                    ),
                  };
                }
                return { ...s, partialReps: defaultPartialReps() };
              }),
            };
          }),
        })),

      // ── Notes actions ─────────────────────────────────────────────────────

      toggleNotes: (setId) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                return { ...s, notes: { enabled: !s.notes.enabled, text: "" } };
              }),
            };
          }),
        })),

      updateNotes: (setId, note) =>
        set((state) => ({
          routines: state.routines.map((r) => {
            if (r.id !== state.editingRoutineId) return r;
            return {
              ...r,
              steps: r.steps.map((s) => {
                if (s.id !== setId || s.type === "rest") return s;
                return { ...s, notes: { ...s.notes, text: note } };
              }),
            };
          }),
        })),
    }),
    {
      name: "global-routines-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ routines: state.routines }),
    },
  ),
);
