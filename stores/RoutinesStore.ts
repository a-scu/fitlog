import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Routine, RoutineDay } from "@/types/Routine";

interface RoutinesStore {
  routines: Routine[];

  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  updateRoutine: (routineId: string, field: keyof Routine, value: any) => void;
  updateRoutineDay: (routineId: string, dayIndex: number, field: keyof RoutineDay, value: any) => void;
  deleteAllRoutines: () => void;
}

export const useRoutinesStore = create<RoutinesStore>()(
  persist(
    (set, get) => ({
      routines: [],

      setRoutines: (routines: Routine[]) => set({ routines }),

      addRoutine: (routine: Routine) =>
        set((state) => {
          if (state.routines.some((r) => r.id === routine.id)) return state;
          return { routines: [routine, ...state.routines] };
        }),

      updateRoutine: (routineId: string, field: keyof Routine, value: any) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === routineId ? { ...r, [field]: value } : r)),
        })),

      updateRoutineDay: (routineId, dayIndex, field, value) =>
        set((state) => ({
          routines: state.routines.map((routine) => {
            if (routine.id !== routineId) return routine;
            return {
              ...routine,
              days: routine.days.map((day) => (day.dayIndex === dayIndex ? { ...day, [field]: value } : day)),
            };
          }),
        })),

      deleteRoutine: (routineId: string) =>
        set((state) => ({ routines: state.routines.filter((routine) => routine.id !== routineId) })),

      deleteAllRoutines: () => set({ routines: [] }),
    }),

    {
      name: "routines",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
