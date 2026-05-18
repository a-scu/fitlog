import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Routine, RoutineDay } from "@/types/Routine";

interface RoutinesStore {
  routines: Routine[];

  getRoutine: (routineId: string | null) => Routine | undefined;
  setRoutines: (routines: Routine[]) => void;
  addRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  updateRoutine: (routineId: string, field: keyof Routine, value: any) => void;
  updateRoutineDay: (
    routineId: string,
    dayIndex: number,
    field: keyof RoutineDay,
    value: any,
  ) => void;

  deleteAllRoutines: () => void;

  updateWeekOverride: (
    routineId: string,
    weekId: string,
    days: RoutineDay[],
  ) => void;
  discardWeekOverride: (routineId: string, weekId: string) => void;
}

export const useRoutinesStore = create<RoutinesStore>()(
  persist(
    (set, get) => ({
      routines: [],

      getRoutine: (routineId: string | null) => {
        if (routineId === null) return;
        const routine = get().routines.find(
          (routine) => routine.id === routineId,
        );
        return routine;
      },

      setRoutines: (routines: Routine[]) => set({ routines }),

      addRoutine: (routine: Routine) =>
        set((state) => {
          if (state.routines.some((r) => r.id === routine.id)) return state;
          return { routines: [routine, ...state.routines] };
        }),

      updateRoutine: (routineId: string, field: keyof Routine, value: any) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId ? { ...r, [field]: value } : r,
          ),
        })),

      updateRoutineDay: (routineId, dayIndex, field, value) =>
        set((state) => ({
          routines: state.routines.map((routine) => {
            if (routine.id !== routineId) return routine;
            return {
              ...routine,
              days: routine.days.map((day) =>
                day.dayIndex === dayIndex ? { ...day, [field]: value } : day,
              ),
            };
          }),
        })),

      updateWeekOverride: (routineId, weekId, days) =>
        set((state) => ({
          routines: state.routines.map((routine) => {
            if (routine.id !== routineId) return routine;
            return {
              ...routine,
              weekOverrides: {
                ...routine.weekOverrides,
                [weekId]: { weekId, days },
              },
            };
          }),
        })),

      discardWeekOverride: (routineId: string, weekId: string) =>
        set((state) => {
          const routine = state.routines.find((r) => r.id === routineId);
          if (!routine || !routine.weekOverrides) return state;
          const { [weekId]: _, ...rest } = routine.weekOverrides;
          return {
            routines: state.routines.map((r) =>
              r.id === routineId ? { ...r, weekOverrides: rest } : r,
            ),
          };
        }),

      deleteRoutine: (routineId: string) =>
        set((state) => ({
          routines: state.routines.filter(
            (routine) => routine.id !== routineId,
          ),
        })),

      deleteAllRoutines: () => set({ routines: [] }),
    }),

    {
      name: "routines",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
