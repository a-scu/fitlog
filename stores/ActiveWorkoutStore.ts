import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWorkoutsHistoryStore } from "./WorkoutsHistoryStore";
import { startOfDay } from "date-fns";
import { randomId } from "@/utils/random";

import { WORKOUT_INACTIVITY_TIMEOUT_MS } from "@/constants/Workout";

interface ActiveWorkoutStore {
  activeWorkoutId: string | null; // "free" o ID del workout
  routineId: string | null;
  startTime: string | null;
  isPaused: boolean;
  lastInteractionTime: string | null;
  currentRoute: string | null;
  showAutoFinishNotification: boolean;
  freeWorkout: boolean;

  startWorkout: (workoutId: string, routineId?: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => void;
  setCurrentRoute: (route: string | null) => void;
  updateInteractionTime: () => void;
  checkTimeout: () => void;
  clearAutoFinishNotification: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>()(
  persist(
    (set, get) => ({
      activeWorkoutId: null,
      routineId: null,
      startTime: null,
      isPaused: false,
      lastInteractionTime: null,
      currentRoute: null,
      showAutoFinishNotification: false,
      freeWorkout: false,

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
            .updateWorkoutSessionField(today, "freeWorkout", true);
        }

        if (routineId) {
          useWorkoutsHistoryStore
            .getState()
            .updateWorkoutSessionField(today, "routineId", routineId);
        }

        set({
          activeWorkoutId: actualWorkoutId,
          routineId: routineId || null,
          startTime: new Date().toISOString(),
          lastInteractionTime: new Date().toISOString(),
          isPaused: false,
          showAutoFinishNotification: false,
          freeWorkout: isFree,
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
          routineId: null,
          startTime: null,
          lastInteractionTime: null,
          isPaused: false,
          freeWorkout: false,
        });
      },

      setCurrentRoute: (route) => set({ currentRoute: route }),

      updateInteractionTime: () => {
        if (get().activeWorkoutId) {
          set({ lastInteractionTime: new Date().toISOString() });
        }
      },

      checkTimeout: () => {
        const { activeWorkoutId, lastInteractionTime, finishWorkout } = get();
        if (!activeWorkoutId || !lastInteractionTime) return;

        const lastActive = new Date(lastInteractionTime).getTime();
        const now = new Date().getTime();
        const diffInMs = now - lastActive;

        if (diffInMs >= WORKOUT_INACTIVITY_TIMEOUT_MS) {
          // If more than 3 hours passed, finish workout
          finishWorkout();
          set({ showAutoFinishNotification: true });
        } else {
          // If less than 3 hours, we just reset the interaction time to "now"
          // as the user requested ("el contador se resetea")
          set({ lastInteractionTime: new Date().toISOString() });
        }
      },

      clearAutoFinishNotification: () =>
        set({ showAutoFinishNotification: false }),
    }),
    {
      name: "active-workout-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
