import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            mode: "system",
            setMode: (mode) => {
                // Drive NativeWind's 'media' dark mode via the OS Appearance API
                if (mode === "system") {
                    Appearance.setColorScheme(null); // restore OS preference
                } else {
                    Appearance.setColorScheme(mode);
                }
                set({ mode });
            },
        }),
        {
            name: "theme-settings",
            storage: createJSONStorage(() => AsyncStorage),
            // Re-apply the stored preference on hydration
            onRehydrateStorage: () => (state) => {
                if (state && state.mode !== "system") {
                    Appearance.setColorScheme(state.mode);
                }
            },
        }
    )
);

/**
 * Returns the resolved theme and helpers. Use this anywhere instead of useColorScheme().
 *
 * @example
 * const { theme, isDark } = useTheme();
 * <View style={{ backgroundColor: isDark ? '#000' : '#fff' }} />
 */
export function useTheme() {
    const scheme = useColorScheme();
    const theme = scheme === "dark" ? "dark" : "light";
    return {
        theme,
        isDark: theme === "dark",
        isLight: theme === "light",
    } as const;
}
