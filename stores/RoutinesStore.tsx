import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Set } from "@/screens/ExerciseScreen/types";

type Rest = {
  duration: number;
};

type Routine = {
  id: string;
  name: string;
  steps: (Set | Rest)[];
};

interface RoutinesStore {
  routines: Routine[];
  setRoutines: (routines: Routine[]) => void;
}

export const useRoutines = create<RoutinesStore>()(
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
