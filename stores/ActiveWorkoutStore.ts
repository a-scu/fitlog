import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWorkoutsHistoryStore } from "./WorkoutsHistoryStore";
import { persist, createJSONStorage } from "zustand/middleware";
import { randomId } from "@/utils/random";
import { startOfDay } from "date-fns";
import { create } from "zustand";

interface ActiveWorkoutStore {
  activeWorkoutId: string | null; // "free" o ID del workout
  startTime: string | null;
  isPaused: boolean;
  lastInteractionTime: string | null;

  startWorkout: (workoutId: string, routineId?: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => void;
  updateInteractionTime: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  persist(
    (set, get) => ({
      activeWorkoutId: null,
      startTime: null,
      isPaused: false,
      lastInteractionTime: null,

      startWorkout: (workoutId, routineId) => {
        const today = new Date();
        const isFree = workoutId === "free" || !workoutId;
        const actualWorkoutId = isFree ? randomId() : workoutId;

        useWorkoutsHistoryStore
          .getState()
          .updateWorkoutSessionField(today, "workoutId", actualWorkoutId);

        if (isFree) {
          useWorkoutsHistoryStore
            .getState()
            .updateWorkoutSessionField(today, "isFreeWorkout", true);
        }

        set({
          activeWorkoutId: actualWorkoutId,
          startTime: new Date().toISOString(),
          lastInteractionTime: new Date().toISOString(),
          isPaused: false,
        });
      },

      pauseWorkout: () =>
        set({
          isPaused: true,
          lastInteractionTime: new Date().toISOString(),
        }),

      resumeWorkout: () =>
        set({
          isPaused: false,
          lastInteractionTime: new Date().toISOString(),
        }),

      finishWorkout: () => {
        const today = startOfDay(new Date()).toISOString();
        useWorkoutsHistoryStore
          .getState()
          .updateWorkoutSessionField(today, "status", "completed");

        set({
          activeWorkoutId: null,
          startTime: null,
          lastInteractionTime: null,
          isPaused: false,
        });
      },

      updateInteractionTime: () => {
        if (get().activeWorkoutId) {
          set({ lastInteractionTime: new Date().toISOString() });
        }
      },
    }),
    {
      name: "active-workout-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
