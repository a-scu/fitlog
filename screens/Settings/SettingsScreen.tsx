import { useState, useEffect } from "react";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useUserStore } from "@/stores/UserStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useThemeStore } from "@/stores/ThemeStore";
import { useTranslation } from "react-i18next";
import i18n, { AVAILABLE_LANGUAGES, AppLanguage } from "@/lib/i18n";
import { Image } from "expo-image";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileSection from "./components/ProfileSection";
import ThemeSelector from "./components/ThemeSelector";
import Constants from "expo-constants";

export default function SettingsScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const setHasCompletedOnboarding = useGlobalSettingsStore(
    (s) => s.setHasCompletedOnboarding,
  );

  const user = useUserStore((s) => s.user);
  const signOut = useUserStore((s) => s.signOut);

  const deleteAllWorkouts = useWorkoutsStore((s) => s.deleteAllWorkouts);
  const deleteAllRoutines = useRoutinesStore((s) => s.deleteAllRoutines);

  const deleteAllHistory = useWorkoutsHistoryStore((s) => s.deleteAllHistory);

  const deleteAllWorkspaces = useWorkspacesStore((s) => s.deleteAllWorkspaces);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleSignOut = async () => {
    await signOut();
    setHasCompletedOnboarding(false);
  };

  const resetApp = () => {
    Alert.alert(
      "Resetear App",
      "¿Estás seguro? Se borrarán todos tus datos locales.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          style: "destructive",
          onPress: () => {
            deleteAllWorkouts();
            deleteAllRoutines();
            deleteAllHistory();
            deleteAllWorkspaces();
            setHasCompletedOnboarding(false);
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "¿Estás seguro? Esta acción es irreversible y borrará todos tus datos de nuestros servidores.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await useUserStore.getState().deleteAccount();
              setHasCompletedOnboarding(false);
              Alert.alert(
                "Cuenta eliminada",
                "Tu cuenta ha sido borrada correctamente.",
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "No se pudo eliminar la cuenta. Es posible que necesites volver a iniciar sesión para realizar esta acción.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 dark:bg-neutral-950"
      contentContainerClassName="p-4 grow"
    >
      <ProfileSection />

      <ThemeSelector />

      <View className="mt-8 gap-3">
        <Text className="text-sm font-bold text-neutral-400 uppercase ml-1">
          {t("screens.settings.general", "General")}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("programs")}
          className="bg-white dark:bg-neutral-800 p-4 rounded-3xl flex-row items-center justify-between border border-neutral-100 dark:border-neutral-700"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Ionicons name="barbell-outline" size={20} color="#10b981" />
            </View>
            <Text className="text-neutral-800 dark:text-white font-semibold text-lg">
              Mis rutinas / Workouts
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("language")}
          className="bg-white dark:bg-neutral-800 p-4 rounded-3xl flex-row items-center justify-between border border-neutral-100 dark:border-neutral-700"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Ionicons name="language" size={20} color="#6366f1" />
            </View>
            <Text className="text-neutral-800 dark:text-white font-semibold text-lg">
              {t("screens.settings.language", "Idioma")}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-neutral-400 dark:text-neutral-500 text-sm">
              {AVAILABLE_LANGUAGES[i18n.language as AppLanguage]?.label ||
                i18n.language}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Actions Section */}
      <View className="mt-8 gap-3">
        {user && (
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-2xl flex-row items-center justify-between border border-neutral-200 dark:border-neutral-700"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Ionicons name="log-out" size={20} color="#ef4444" />
              </View>
              <Text className="text-red-500 font-bold text-lg">
                Cerrar Sesión
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}

        {user && (
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex-row items-center justify-between border border-red-100 dark:border-red-900/30"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <Ionicons name="trash" size={20} color="#ef4444" />
              </View>
              <Text className="text-red-600 dark:text-red-500 font-bold text-lg">
                Eliminar Cuenta
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#ef4444"
              opacity={0.5}
            />
          </TouchableOpacity>
        )}

        {__DEV__ && (
          <TouchableOpacity
            onPress={resetApp}
            className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-2xl flex-row items-center justify-between border border-neutral-200 dark:border-neutral-700"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
                <Ionicons name="refresh" size={20} color="#6b7280" />
              </View>
              <Text className="text-neutral-600 dark:text-neutral-400 font-bold text-lg">
                Resetear App
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <View className="mt-auto py-6 items-center">
        <Text className="text-neutral-400 text-xs">Fitlog v{appVersion}</Text>
      </View>
    </ScrollView>
  );
}
