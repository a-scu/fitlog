import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { isSameDay } from "date-fns";
import { create } from "zustand";

import { LoggedSet, WorkoutSession } from "@/types/History";
import { DropSet } from "@/types/Workout";

import { randomId } from "@/utils/random";

interface WorkoutsHistoryStore {
  workoutSessions: WorkoutSession[];

  addWorkoutSession: (workoutSession: WorkoutSession) => void;
  getWorkoutSession: (date: string | Date) => WorkoutSession;
  updateWorkoutSession: (date: string | Date, workoutSession: Partial<WorkoutSession>) => void;
  updateWorkoutSessionField: (date: string | Date, field: keyof WorkoutSession, value: any) => void;
  deleteWorkoutSession: (id: string) => void;

  addSet: (date: string | Date, exerciseId: string) => void;
  toggleSetCompleted: (date: string | Date, setId: string, exerciseId: string) => void;
  updateSetField: (date: string | Date, setId: string, exerciseId: string, field: keyof LoggedSet, value: string | number | boolean) => void;
  removeSet: (date: string | Date, setId: string) => void;

  addDropSet: (date: string | Date, setId: string, exerciseId: string, plannedDropSetId?: string) => void;
  updateDropSetField: (date: string | Date, setId: string, exerciseId: string, dropSetId: string, field: string, value: string | number, plannedDropSetId?: string) => void;
  removeDropSet: (date: string | Date, setId: string, dropSetId: string) => void;

  deleteAllHistory: () => void;
}

const createNewSession = (date: string | Date, sets: LoggedSet[] = [], extra: Partial<WorkoutSession> = {}): WorkoutSession => ({
  id: randomId(),
  date: typeof date === "string" ? date : date.toISOString(),
  duration: 0,
  notes: "",
  sets,
  ...extra,
});

export const useWorkoutsHistoryStore = create<WorkoutsHistoryStore>()(
  persist(
    (set, get) => ({
      workoutSessions: [],

      getWorkoutSession: (date) => {
        const workoutSession = get().workoutSessions.find((s) => isSameDay(s.date, date));
        if (!workoutSession) {
          const newSession = createNewSession(date);
          set((state) => ({ workoutSessions: [newSession, ...state.workoutSessions] }));
          return newSession;
        }
        return workoutSession;
      },

      addWorkoutSession: (workoutSession) =>
        set((state) => ({
          workoutSessions: [workoutSession, ...state.workoutSessions],
        })),

      updateWorkoutSession: (date, workoutSessionUpdate) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          if (!exists) {
            const newSession = createNewSession(date, [], workoutSessionUpdate);
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }
          return {
            workoutSessions: state.workoutSessions.map((s) => (isSameDay(s.date, date) ? { ...s, ...workoutSessionUpdate } : s)),
          };
        });
      },

      updateWorkoutSessionField: (date, field, value) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          if (!exists) {
            const newSession = createNewSession(date, [], { [field]: value });
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }
          return {
            workoutSessions: state.workoutSessions.map((s) => (isSameDay(s.date, date) ? { ...s, [field]: value } : s)),
          };
        });
      },

      deleteWorkoutSession: (id) =>
        set((state) => ({
          workoutSessions: state.workoutSessions.filter((s) => s.id !== id),
        })),

      addSet: (date, exerciseId) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          const newSet: LoggedSet = {
            id: randomId(),
            exerciseId,
            completed: false,
            weight: 0,
            reps: 0,
            rir: 0,
            dropSets: [],
          };

          if (!exists) {
            const newSession = createNewSession(date, [newSet]);
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }

          return {
            workoutSessions: state.workoutSessions.map((s) => (isSameDay(s.date, date) ? { ...s, sets: [...s.sets, newSet] } : s)),
          };
        });
      },

      updateSetField: (date, setId, exerciseId, field, value) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          const newSet: LoggedSet = {
            id: setId,
            exerciseId,
            completed: false,
            dropSets: [],
            [field]: value,
          };

          if (!exists) {
            const newSession = createNewSession(date, [newSet]);
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }

          return {
            workoutSessions: state.workoutSessions.map((session) => {
              if (!isSameDay(session.date, date)) return session;

              const setExists = session.sets.some((set) => set.id === setId);
              const updatedSets = setExists
                ? session.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set))
                : [...session.sets, newSet];

              return { ...session, sets: updatedSets };
            }),
          };
        });
      },

      toggleSetCompleted: (date, setId, exerciseId) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          if (!exists) {
            const newSession = createNewSession(date, [{ id: setId, exerciseId, completed: true, dropSets: [] }]);
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }

          return {
            workoutSessions: state.workoutSessions.map((session) => {
              if (!isSameDay(session.date, date)) return session;

              const currentSet = session.sets.find((set) => set.id === setId);
              if (!currentSet) {
                return {
                  ...session,
                  sets: [...session.sets, { id: setId, exerciseId, completed: true, dropSets: [] }],
                };
              }

              // If it was completed, toggle removes it. Otherwise, mark as completed.
              const updatedSets = currentSet.completed
                ? session.sets.filter((set) => set.id !== setId)
                : session.sets.map((set) => (set.id === setId ? { ...set, completed: true } : set));

              return { ...session, sets: updatedSets };
            }),
          };
        });
      },

      removeSet: (date, setId) => {
        set((state) => ({
          workoutSessions: state.workoutSessions.map((s) => (isSameDay(s.date, date) ? { ...s, sets: s.sets.filter((set) => set.id !== setId) } : s)),
        }));
      },

      addDropSet: (date, setId, exerciseId, plannedDropSetId) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          const newSet: LoggedSet = {
            id: setId,
            exerciseId,
            completed: false,
            weight: 0,
            reps: 0,
            rir: 0,
            dropSets: [{ id: randomId(), plannedDropSetId, weight: 0, reps: 0 }],
          };

          if (!exists) {
            const newSession = createNewSession(date, [newSet]);
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }

          return {
            workoutSessions: state.workoutSessions.map((session) => {
              if (!isSameDay(session.date, date)) return session;

              const setExists = session.sets.some((set) => set.id === setId);
              const updatedSets = setExists
                ? session.sets.map((set) =>
                    set.id === setId
                      ? {
                          ...set,
                          dropSets: [...(set.dropSets || []), { id: randomId(), plannedDropSetId, weight: 0, reps: 0 }],
                        }
                      : set,
                  )
                : [...session.sets, newSet];

              return { ...session, sets: updatedSets };
            }),
          };
        });
      },

      updateDropSetField: (date, setId, exerciseId, dropSetId, field, value, plannedDropSetId) => {
        set((state) => {
          const exists = state.workoutSessions.some((s) => isSameDay(s.date, date));
          
          const newDropSet = { 
            id: plannedDropSetId ? randomId() : dropSetId, 
            plannedDropSetId, 
            weight: field === "weight" ? Number(value) || 0 : 0, 
            reps: field === "reps" ? Number(value) || 0 : 0, 
          };
          
          const newSet: LoggedSet = {
            id: setId,
            exerciseId,
            completed: false,
            weight: 0,
            reps: 0,
            rir: 0,
            dropSets: [newDropSet],
          };

          if (!exists) {
            const newSession = createNewSession(date, [newSet]);
            return { workoutSessions: [newSession, ...state.workoutSessions] };
          }

          return {
            workoutSessions: state.workoutSessions.map((session) => {
              if (!isSameDay(session.date, date)) return session;

              const setExists = session.sets.some((set) => set.id === setId);
              if (!setExists) {
                return { ...session, sets: [...session.sets, newSet] };
              }

              const updatedSets = session.sets.map((set) => {
                if (set.id !== setId) return set;

                const currentDropSets = set.dropSets || [];
                const existingIndex = currentDropSets.findIndex(
                  (ds) => ds.id === dropSetId || (plannedDropSetId && ds.plannedDropSetId === plannedDropSetId)
                );

                const updatedDropSets = [...currentDropSets];
                if (existingIndex !== -1) {
                  updatedDropSets[existingIndex] = {
                    ...updatedDropSets[existingIndex],
                    [field]: Number(value) || 0,
                    ...(plannedDropSetId ? { plannedDropSetId } : {}),
                  };
                } else {
                  updatedDropSets.push(newDropSet);
                }

                return { ...set, dropSets: updatedDropSets };
              });

              return { ...session, sets: updatedSets };
            }),
          };
        });
      },

      removeDropSet: (date, setId, dropSetId) => {
        set((state) => ({
          workoutSessions: state.workoutSessions.map((session) => {
            if (!isSameDay(session.date, date)) return session;

            const updatedSets = session.sets.map((set) => {
              if (set.id !== setId) return set;

              const updatedDropSets = (set.dropSets || []).filter((ds) => ds.id !== dropSetId);
              return { ...set, dropSets: updatedDropSets };
            });
            return { ...session, sets: updatedSets };
          }),
        }));
      },

      deleteAllHistory: () => set({ workoutSessions: [] }),
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
