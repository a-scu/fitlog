import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Workout, Set, Rest, Metric, PartialReps, Step } from "@/types/Workout";
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

interface WorkoutsStore {
  workouts: Workout[];
  editingWorkoutId: string | null;

  setWorkouts: (workouts: Workout[]) => void;
  setEditingWorkoutId: (id: string | null) => void;

  // Acciones de Rutina
  addWorkout: (workout: Workout) => void;
  duplicateWorkout: (workoutId: string) => void;
  updateWorkoutName: (name: string) => void;
  updateWorkoutSteps: (workoutId: string, steps: any[]) => void;
  deleteWorkout: (workoutId?: string) => void;
  deleteAllWorkouts: () => void;

  // Acciones de Pasos (Sets/Descansos)
  addSet: (exerciseId: string, setConfig?: { weight?: string; reps?: string; rir?: string }) => void;
  addRest: () => void;
  duplicateStep: (stepId: string) => void;
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

export const useWorkoutsStore = create<WorkoutsStore>()(
  persist(
    (set) => ({
      workouts: [],
      editingWorkoutId: null,

      setWorkouts: (workouts) => set({ workouts }),
      setEditingWorkoutId: (id) => set({ editingWorkoutId: id }),

      addWorkout: (workout: Workout) =>
        set((state) => {
          return {
            workouts: [workout, ...state.workouts],
          };
        }),
      duplicateWorkout: (workoutId) =>
        set((state) => {
          const workoutToDuplicate = state.workouts.find((w) => w.id === workoutId);
          if (!workoutToDuplicate) return state;

          const duplicatedWorkout: Workout = {
            ...workoutToDuplicate,
            id: randomId(),
            name: `${workoutToDuplicate.name} (Copia)`,
            steps: workoutToDuplicate.steps.map((step) => {
              if (step.type === "rest") {
                return { ...step, id: randomId() };
              }
              return {
                ...step,
                id: randomId(),
                weight: { ...step.weight },
                reps: { ...step.reps },
                rir: { ...step.rir },
                partialReps: { ...step.partialReps },
                notes: { ...step.notes },
                dropSets: step.dropSets.map((ds) => ({
                  ...ds,
                  id: randomId(),
                  weight: { ...ds.weight },
                  reps: { ...ds.reps },
                  rir: { ...ds.rir },
                  partialReps: { ...ds.partialReps },
                })),
              };
            }),
          };

          return {
            workouts: [...state.workouts, duplicatedWorkout],
          };
        }),
      updateWorkoutName: (name) =>
        set((state) => ({
          workouts: state.workouts.map((r) => (r.id === state.editingWorkoutId ? { ...r, name } : r)),
        })),

      updateWorkoutSteps: (workoutId, steps) =>
        set((state) => ({
          workouts: state.workouts.map((r) => (r.id === workoutId ? { ...r, steps } : r)),
        })),

      deleteWorkout: (workoutId?: string) =>
        set((state) => ({
          workouts: state.workouts.filter((r) =>
            state.editingWorkoutId ? r.id !== state.editingWorkoutId : r.id !== workoutId,
          ),
        })),

      deleteAllWorkouts: () => set({ workouts: [] }),

      addSet: (exerciseId, { weight, reps, rir } = {}) =>
        set((state) => {
          if (!state.editingWorkoutId) return state;
          const newId = randomId();
          return {
            workouts: state.workouts.map((r) => {
              if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) =>
            r.id === state.editingWorkoutId
              ? { ...r, steps: [...r.steps, { id: randomId(), type: "rest", duration: 60 }] }
              : r,
          ),
        })),

      duplicateStep: (stepId) =>
        set((state) => {
          if (!state.editingWorkoutId) return state;
          return {
            workouts: state.workouts.map((workout) => {
              if (workout.id !== state.editingWorkoutId) return workout;

              const stepIndex = workout.steps.findIndex((s) => s.id === stepId);
              if (stepIndex === -1) return workout;

              const stepToDuplicate = workout.steps[stepIndex];
              let duplicatedStep: Step;

              if (stepToDuplicate.type === "rest") {
                duplicatedStep = {
                  ...stepToDuplicate,
                  id: randomId(),
                };
              } else {
                duplicatedStep = {
                  ...stepToDuplicate,
                  id: randomId(),
                  // Deep clone dropsets with new IDs
                  dropSets: stepToDuplicate.dropSets.map((ds) => ({
                    ...ds,
                    id: randomId(),
                    weight: { ...ds.weight },
                    reps: { ...ds.reps },
                    rir: { ...ds.rir },
                    partialReps: { ...ds.partialReps },
                  })),
                  // Deep clone objects to avoid shared references
                  weight: { ...stepToDuplicate.weight },
                  reps: { ...stepToDuplicate.reps },
                  rir: { ...stepToDuplicate.rir },
                  partialReps: { ...stepToDuplicate.partialReps },
                  notes: { ...stepToDuplicate.notes },
                };
              }

              const newSteps = [...workout.steps];
              newSteps.splice(stepIndex + 1, 0, duplicatedStep);

              return { ...workout, steps: newSteps };
            }),
          };
        }),

      updateRestDuration: (stepId, duration) =>
        set((state) => ({
          workouts: state.workouts.map((r) =>
            r.id === state.editingWorkoutId
              ? {
                  ...r,
                  steps: r.steps.map((s) => (s.id === stepId && s.type === "rest" ? { ...s, duration } : s)),
                }
              : r,
          ),
        })),

      deleteStep: (stepId) =>
        set((state) => ({
          workouts: state.workouts.map((r) =>
            r.id === state.editingWorkoutId
              ? {
                  ...r,
                  steps: r.steps.filter((s) => s.id !== stepId),
                }
              : r,
          ),
        })),

      updateSetField: (setId, field, value) =>
        set((state) => ({
          workouts: state.workouts.map((r) =>
            r.id === state.editingWorkoutId
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
          workouts: state.workouts.map((r) =>
            r.id === state.editingWorkoutId
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
          workouts: state.workouts.map((r) =>
            r.id === state.editingWorkoutId
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
          workouts: state.workouts.map((r) => {
            if (r.id !== state.editingWorkoutId) return r;
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
      name: "global-workouts-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ workouts: state.workouts }),
    },
  ),
);
