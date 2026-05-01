import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ActiveWorkoutStore {
  activeWorkoutId: string | null; // "free" o ID del workout
  routineId: string | null;
  startTime: string | null;
  isPaused: boolean;
  currentRoute: string | null;

  startWorkout: (workoutId: string, routineId?: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => void;
  setCurrentRoute: (route: string | null) => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  persist(
    (set) => ({
      activeWorkoutId: null,
      routineId: null,
      startTime: null,
      isPaused: false,
      currentRoute: null,

      startWorkout: (workoutId, routineId) =>
        set({
          activeWorkoutId: workoutId,
          routineId: routineId || null,
          startTime: new Date().toISOString(),
          isPaused: false,
        }),

      pauseWorkout: () => set({ isPaused: true }),
      
      resumeWorkout: () => set({ isPaused: false }),

      finishWorkout: () =>
        set({
          activeWorkoutId: null,
          routineId: null,
          startTime: null,
          isPaused: false,
        }),

      setCurrentRoute: (route) => set({ currentRoute: route }),
    }),
    {
      name: "active-workout-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
