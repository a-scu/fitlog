import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GlobalRoutinesSettings {
    weightUnit : 'kg' | 'lbs';
    advancedMode : boolean;
    hasCompletedOnboarding: boolean;
    toggleWeightUnit : () => void;
    toggleAdvancedMode : () => void;
    setHasCompletedOnboarding: (value: boolean) => void;
}

export const useGlobalSettingsStore = create<GlobalRoutinesSettings>()(
    persist(
        (set) => ({
            weightUnit : 'kg',
            advancedMode: false,
            hasCompletedOnboarding: false,

            toggleWeightUnit : () => set((state) => ({ weightUnit : state.weightUnit === 'kg' ? 'lbs' : 'kg' })),
            toggleAdvancedMode : () => set((state) => ({ advancedMode : !state.advancedMode })),
            setHasCompletedOnboarding: (value: boolean) => set({ hasCompletedOnboarding: value }),
        }),
        {
            name: 'global-routines-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
