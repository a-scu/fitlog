import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface GlobalRoutinesSettings {
    weightUnit : 'kg' | 'lbs';
    showSliders : boolean;
    advancedMode : boolean;
    toggleWeightUnit : () => void;
    toggleShowSliders : () => void;
    toggleAdvancedMode : () => void;
}

export const useGlobalRoutinesSettings = create<GlobalRoutinesSettings>()(
    persist(
        (set) => ({
            weightUnit : 'kg',
            showSliders : false,
            advancedMode: false,

            toggleWeightUnit : () => set((state) => ({ weightUnit : state.weightUnit === 'kg' ? 'lbs' : 'kg' })),
            toggleShowSliders : () => set((state) => ({ showSliders : !state.showSliders })),
            toggleAdvancedMode : () => set((state) => ({ advancedMode : !state.advancedMode })),
        }),
        {
            name: 'global-routines-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
