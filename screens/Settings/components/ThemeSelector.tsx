import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeStore } from "@/stores/ThemeStore";

export default function ThemeSelector() {
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  return (
    <View className="mt-8">
      <Text className="text-sm font-bold text-neutral-400 uppercase mb-3 ml-1">
        Apariencia
      </Text>

      <View className="bg-white dark:bg-neutral-800 rounded-3xl p-2 shadow-sm border border-neutral-100 dark:border-neutral-700 flex-row">
        <TouchableOpacity
          onPress={() => setThemeMode("light")}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl ${
            themeMode === "light" ? "bg-neutral-100 dark:bg-neutral-700" : ""
          }`}
        >
          <Ionicons
            name="sunny"
            size={20}
            color={themeMode === "light" ? "#f59e0b" : "#9ca3af"}
          />
          <Text
            className={`font-semibold ${themeMode === "light" ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}
          >
            Claro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setThemeMode("dark")}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl ${
            themeMode === "dark" ? "bg-neutral-100 dark:bg-neutral-700" : ""
          }`}
        >
          <Ionicons
            name="moon"
            size={20}
            color={themeMode === "dark" ? "#6366f1" : "#9ca3af"}
          />
          <Text
            className={`font-semibold ${themeMode === "dark" ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}
          >
            Oscuro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setThemeMode("system")}
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl ${
            themeMode === "system" ? "bg-neutral-100 dark:bg-neutral-700" : ""
          }`}
        >
          <Ionicons
            name="phone-portrait"
            size={20}
            color={themeMode === "system" ? "#10b981" : "#9ca3af"}
          />
          <Text
            className={`font-semibold ${themeMode === "system" ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}
          >
            Sistema
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
