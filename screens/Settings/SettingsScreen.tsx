import { useState, useEffect } from "react";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useUserStore } from "@/stores/UserStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useThemeStore } from "@/stores/ThemeStore";
import { Image } from "expo-image";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const user = useUserStore((s) => s.user);
  const signOut = useUserStore((s) => s.signOut);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const loading = useUserStore((s) => s.loading);

  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const deleteAllWorkouts = useWorkoutsStore((s) => s.deleteAllWorkouts);
  const deleteAllRoutines = useRoutinesStore((s) => s.deleteAllRoutines);
  const deleteAllHistory = useWorkoutsHistoryStore((s) => s.deleteAllHistory);
  const deleteAllWorkspaces = useWorkspacesStore((s) => s.deleteAllWorkspaces);
  const setHasCompletedOnboarding = useGlobalSettingsStore((s) => s.setHasCompletedOnboarding);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setNickname(user.nickname || "");
      setUsername(user.username || "");
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName,
        nickname,
        username,
      });
      setIsEditing(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  console.log("user", user);

  const handleSignOut = async () => {
    await signOut();
    setHasCompletedOnboarding(false);
  };

  const resetApp = () => {
    Alert.alert("Resetear App", "¿Estás seguro? Se borrarán todos tus datos locales.", [
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
    ]);
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
              Alert.alert("Cuenta eliminada", "Tu cuenta ha sido borrada correctamente.");
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
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900" contentContainerClassName="p-4 grow">
      <Text className="text-2xl font-black text-neutral-900 dark:text-white mb-6">Ajustes</Text>

      {/* Profile Section */}
      <View className="bg-white dark:bg-neutral-800 rounded-3xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700">
        <View className="flex-row items-center gap-4 mb-6">
          <View className="size-20 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden border-2 border-emerald-500">
            <Image
              source={user?.photoURL ? { uri: user?.photoURL } : require("@/assets/images/icon.png")}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-neutral-900 dark:text-white">{user?.displayName || "Usuario"}</Text>
            <Text className="text-neutral-500 dark:text-neutral-400">{user?.email}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full"
          >
            <Ionicons name={isEditing ? "close" : "pencil"} size={20} color={isEditing ? "#ef4444" : "#10b981"} />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View className="gap-4">
            <View>
              <Text className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-1">Nombre</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Tu nombre"
                placeholderTextColor="#9ca3af"
                className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-1">Nickname</Text>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Ej: El Guerrero"
                placeholderTextColor="#9ca3af"
                className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-1">Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="usuario123"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="bg-emerald-500 p-4 rounded-2xl items-center mt-2 flex-row justify-center gap-2"
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-bold text-lg">Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-700">
              <Text className="text-neutral-500 dark:text-neutral-400">Nickname</Text>
              <Text className="font-semibold text-neutral-900 dark:text-white">{user?.nickname || "-"}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-neutral-500 dark:text-neutral-400">Username</Text>
              <Text className="font-semibold text-neutral-900 dark:text-white">@{user?.username || "sin_usuario"}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Theme Section */}
      <View className="mt-8">
        <Text className="text-sm font-bold text-neutral-400 uppercase mb-3 ml-1">Apariencia</Text>
        <View className="bg-white dark:bg-neutral-800 rounded-3xl p-2 shadow-sm border border-neutral-100 dark:border-neutral-700 flex-row">
          <TouchableOpacity
            onPress={() => setThemeMode("light")}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl ${
              themeMode === "light" ? "bg-neutral-100 dark:bg-neutral-700" : ""
            }`}
          >
            <Ionicons name="sunny" size={20} color={themeMode === "light" ? "#f59e0b" : "#9ca3af"} />
            <Text className={`font-semibold ${themeMode === "light" ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
              Claro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setThemeMode("dark")}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl ${
              themeMode === "dark" ? "bg-neutral-100 dark:bg-neutral-700" : ""
            }`}
          >
            <Ionicons name="moon" size={20} color={themeMode === "dark" ? "#6366f1" : "#9ca3af"} />
            <Text className={`font-semibold ${themeMode === "dark" ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
              Oscuro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setThemeMode("system")}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl ${
              themeMode === "system" ? "bg-neutral-100 dark:bg-neutral-700" : ""
            }`}
          >
            <Ionicons name="phone-portrait" size={20} color={themeMode === "system" ? "#10b981" : "#9ca3af"} />
            <Text className={`font-semibold ${themeMode === "system" ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400"}`}>
              Sistema
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions Section */}
      <View className="mt-8 gap-3">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-2xl flex-row items-center justify-between border border-neutral-200 dark:border-neutral-700"
        >
          <View className="flex-row items-center gap-3">
            <View className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Ionicons name="log-out" size={20} color="#ef4444" />
            </View>
            <Text className="text-red-500 font-bold text-lg">Cerrar Sesión</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetApp}
          className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-2xl flex-row items-center justify-between border border-neutral-200 dark:border-neutral-700"
        >
          <View className="flex-row items-center gap-3">
            <View className="p-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
              <Ionicons name="refresh" size={20} color="#6b7280" />
            </View>
            <Text className="text-neutral-600 dark:text-neutral-400 font-bold text-lg">Resetear App</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex-row items-center justify-between border border-red-100 dark:border-red-900/30"
        >
          <View className="flex-row items-center gap-3">
            <View className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <Ionicons name="trash" size={20} color="#ef4444" />
            </View>
            <Text className="text-red-600 dark:text-red-500 font-bold text-lg">Eliminar Cuenta</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ef4444" opacity={0.5} />
        </TouchableOpacity>
      </View>

      <View className="mt-auto py-6 items-center">
        <Text className="text-neutral-400 text-xs">Fitlog v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
