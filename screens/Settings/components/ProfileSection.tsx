import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { useUserStore } from "@/stores/UserStore";

export default function ProfileSection() {
  const loading = useUserStore((s) => s.loading);
  const user = useUserStore((s) => s.user);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    displayName: user?.displayName || "",
    nickname: user?.nickname || "",
    username: user?.username || "",
  });

  useEffect(() => {
    if (user) {
      setUserForm({
        displayName: user.displayName || "",
        nickname: user.nickname || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile(userForm);
      setIsEditing(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  return (
    <View className="bg-white dark:bg-neutral-800 rounded-3xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700">
      <View className="flex-row items-center gap-4">
        <View className="size-20 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden border-2 border-emerald-500">
          <Image
            source={
              user?.photoURL
                ? { uri: user?.photoURL }
                : require("@/assets/images/icon.png")
            }
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-neutral-900 dark:text-neutral-300">
            @{user?.username || "sin_usuario"}
          </Text>
          <Text className="font-semibold text-neutral-900 text-lg dark:text-white">
            {user?.nickname || "Tu"}
          </Text>
        </View>

        {user && (
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full"
          >
            <Ionicons
              name={isEditing ? "close" : "pencil"}
              size={20}
              color={isEditing ? "#ef4444" : "#10b981"}
            />
          </TouchableOpacity>
        )}
      </View>

      {isEditing && (
        <View className="gap-4 mt-6">
          <View>
            <Text className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-1">
              Nombre
            </Text>
            <TextInput
              value={userForm.displayName}
              onChangeText={(text) =>
                setUserForm({ ...userForm, displayName: text })
              }
              placeholder="Tu nombre"
              placeholderTextColor="#9ca3af"
              className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-1">
              Nickname
            </Text>
            <TextInput
              value={userForm.nickname}
              onChangeText={(text) =>
                setUserForm({ ...userForm, nickname: text })
              }
              placeholder="Ej: El Guerrero"
              placeholderTextColor="#9ca3af"
              className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-400 uppercase mb-1 ml-1">
              Username
            </Text>
            <TextInput
              value={userForm.username}
              onChangeText={(text) =>
                setUserForm({ ...userForm, username: text })
              }
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
                <Text className="text-white font-bold text-lg">
                  Guardar Cambios
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
