import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Routine, Set } from "@/screens/ExerciseScreen/types";



interface RoutinesStore {
  routines: Routine[];
  setRoutines: (routines: Routine[]) => void;
}

export const useRoutinesStore = create<RoutinesStore>()(
  persist(
    (set) => ({
      routines: [],

      setRoutines: (routines: Routine[]) => set({ routines }),
    }),
    {
      name: "global-routines-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
