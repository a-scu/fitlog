import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoggedSet, WorkoutSession } from "@/types/History";
import { randomId } from "@/utils/random";
import { format, isSameDay } from "date-fns";
import { DropSet } from "@/types/Workout";

interface WorkoutsHistoryStore {
  workoutSessions: WorkoutSession[];
  addWorkoutSession: (workoutSession: WorkoutSession) => void;
  updateWorkoutSession: (date: string | Date, workoutSession: Partial<WorkoutSession>) => void;
  updateWorkoutSessionField: (
    date: string | Date,
    field: keyof WorkoutSession,
    value: string | number | string[],
  ) => void;
  deleteWorkoutSession: (id: string) => void;

  getWorkoutSessionsByDate: (date: string) => WorkoutSession[];

  addSet: (date: string | Date, exerciseId: string) => void;
  updateSetField: (date: string | Date, setId: string, exerciseId: string, field: keyof LoggedSet, value: string | number | boolean) => void;
  toggleSetCompleted: (date: string | Date, setId: string, exerciseId: string) => void;
  removeSet: (date: string | Date, setId: string) => void;

  addDropSet: (date: string | Date, setId: string) => void;
  updateDropSetField: (
    date: string | Date,
    setId: string,
    dropSetId: string,
    field: keyof DropSet,
    value: string | number,
  ) => void;
  removeDropSet: (date: string | Date, setId: string, dropSetId: string) => void;
}

export const useWorkoutsHistoryStore = create<WorkoutsHistoryStore>()(
  persist(
    (set, get) => ({
      workoutSessions: [],

      addWorkoutSession: (workoutSession) =>
        set((state) => ({ workoutSessions: [workoutSession, ...state.workoutSessions] })),

      updateWorkoutSession: (date, workoutSessionUpdate) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) =>
                i === sessionIndex ? { ...s, ...workoutSessionUpdate } : s,
              ),
            };
          } else {
            const newSession: WorkoutSession = {
              id: randomId(),
              name: "Entrenamiento",
              date: typeof date === "string" ? date : date.toISOString(),
              duration: 0,
              notes: "",
              sets: [],
              ...workoutSessionUpdate,
            };
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }
        });
      },

      updateWorkoutSessionField: (date, field, value) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) => (i === sessionIndex ? { ...s, [field]: value } : s)),
            };
          } else {
            const newSession: WorkoutSession = {
              id: randomId(),
              name: "Entrenamiento",
              date: typeof date === "string" ? date : date.toISOString(),
              duration: 0,
              notes: "",
              sets: [],
              [field]: value,
            };
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }
        });
      },

      getWorkoutSessionsByDate: (date) => {
        // Assume date is YYYY-MM-DD
        return get().workoutSessions.filter((s) => s.date.startsWith(date));
      },

      addSet: (date, exerciseId) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) =>
                i === sessionIndex
                  ? {
                      ...s,
                      sets: [
                        ...s.sets,
                        { id: randomId(), exerciseId: exerciseId, weight: 0, reps: 0, rir: 0, dropSets: [] },
                      ],
                    }
                  : s,
              ),
            };
          }

          return state;
        });
      },

      deleteWorkoutSession: (id) =>
        set((state) => ({
          workoutSessions: state.workoutSessions.filter((s) => s.id !== id),
        })),

      updateSetField: (date, setId, exerciseId, field, value) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) => {
                if (i === sessionIndex) {
                  const setExists = s.sets.some((set) => set.id === setId);
                  if (setExists) {
                    return { ...s, sets: s.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)) };
                  } else {
                    return {
                      ...s,
                      sets: [
                        ...s.sets,
                        { id: setId, exerciseId, completed: false, dropSets: [], [field]: value },
                      ],
                    };
                  }
                }
                return s;
              }),
            };
          } else {
             // Create the session if it doesn't exist
             const newSession: WorkoutSession = {
              id: randomId(),
              name: "Entrenamiento",
              date: typeof date === "string" ? date : date.toISOString(),
              duration: 0,
              notes: "",
              sets: [{ id: setId, exerciseId, completed: false, dropSets: [], [field]: value }],
            };
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }
        });
      },

      toggleSetCompleted: (date, setId, exerciseId) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) => {
                if (i === sessionIndex) {
                  const setExists = s.sets.some((set) => set.id === setId);
                  if (setExists) {
                    const currentSet = s.sets.find((set) => set.id === setId);
                    if (currentSet?.completed) {
                      // If it was completed, and we toggle, we remove it
                      return { ...s, sets: s.sets.filter((set) => set.id !== setId) };
                    } else {
                      // If it wasn't completed (shouldn't happen with current logic), we mark as true
                      return { ...s, sets: s.sets.map((set) => (set.id === setId ? { ...set, completed: true } : set)) };
                    }
                  } else {
                    return {
                      ...s,
                      sets: [...s.sets, { id: setId, exerciseId, completed: true, dropSets: [] }],
                    };
                  }
                }
                return s;
              }),
            };
          } else {
             const newSession: WorkoutSession = {
              id: randomId(),
              name: "Entrenamiento",
              date: typeof date === "string" ? date : date.toISOString(),
              duration: 0,
              notes: "",
              sets: [{ id: setId, exerciseId, completed: true, dropSets: [] }],
            };
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }
        });
      },

      removeSet: (date, setId) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) =>
                i === sessionIndex ? { ...s, sets: s.sets.filter((s) => s.id !== setId) } : s,
              ),
            };
          }

          return state;
        });
      },

      addDropSet: (date, setId) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) =>
                i === sessionIndex
                  ? {
                      ...s,
                      sets: s.sets.map((set) =>
                        set.id === setId
                          ? { ...set, dropSets: [...(set.dropSets || []), { id: randomId(), weight: 0, reps: 0 }] }
                          : set,
                      ),
                    }
                  : s,
              ),
            };
          }

          return state;
        });
      },

      updateDropSetField: (date, setId, dropSetId, field, value) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) =>
                i === sessionIndex
                  ? {
                      ...s,
                      sets: s.sets.map((s) =>
                        s.id === setId
                          ? {
                              ...s,
                              dropSets: s.dropSets.map((ds) => (ds.id === dropSetId ? { ...ds, [field]: value } : ds)),
                            }
                          : s,
                      ),
                    }
                  : s,
              ),
            };
          }

          return state;
        });
      },

      removeDropSet: (date, setId, dropSetId) => {
        set((state) => {
          const sessionIndex = state.workoutSessions.findIndex((s) => isSameDay(s.date, date));

          if (sessionIndex !== -1) {
            return {
              workoutSessions: state.workoutSessions.map((s, i) =>
                i === sessionIndex
                  ? {
                      ...s,
                      sets: s.sets.map((s) =>
                        s.id === setId ? { ...s, dropSets: s.dropSets.filter((ds) => ds.id !== dropSetId) } : s,
                      ),
                    }
                  : s,
              ),
            };
          }

          return state;
        });
      },
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
