import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GlobalRoutinesSettings {
    weightUnit : 'kg' | 'lbs';
    advancedMode : boolean;
    toggleWeightUnit : () => void;
    toggleAdvancedMode : () => void;
}

export const useGlobalSettingsStore = create<GlobalRoutinesSettings>()(
    persist(
        (set) => ({
            weightUnit : 'kg',
            advancedMode: false,

            toggleWeightUnit : () => set((state) => ({ weightUnit : state.weightUnit === 'kg' ? 'lbs' : 'kg' })),
            toggleAdvancedMode : () => set((state) => ({ advancedMode : !state.advancedMode })),
        }),
        {
            name: 'global-routines-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
