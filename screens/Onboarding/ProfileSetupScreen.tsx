import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/UserStore";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

export default function ProfileSetupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile, loading } = useUserStore();

  const [username, setUsername] = useState(user?.username || "");
  const [nickname, setNickname] = useState(user?.nickname || "");

  useEffect(() => {
    if (!username) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      setUsername(`user_${randomId}`);
    }
  }, []);

  const handleContinue = async () => {
    if (!username.trim()) return;
    await updateProfile({
      username: username.trim(),
      nickname: nickname.trim() || undefined,
    });
    navigation.navigate("tour");
  };

  const handleSkip = async () => {
    // If skipping, we still save the auto-generated username
    if (username) {
      await updateProfile({
        username: username.trim(),
        nickname: nickname.trim() || undefined,
      });
    }
    navigation.navigate("tour");
  };

  // Skip photo upload for now since storage is paid
  return (
    <View
      className="flex-1 bg-neutral-950 px-6"
      style={{ paddingTop: insets.top + 40 }}
    >
      <Text className="text-white text-3xl font-black mb-2 tracking-tight">
        Completa tu perfil
      </Text>
      <Text className="text-neutral-400 text-base mb-10">
        Personaliza cómo te verán los demás.
      </Text>

      <View className="items-center mb-10">
        <View className="w-32 h-32 bg-neutral-800 rounded-full items-center justify-center border-2 border-neutral-700 border-dashed">
          <Ionicons name="camera" size={40} color={colors.neutral[500]} />
        </View>
        <Text className="text-neutral-500 mt-4 text-sm font-medium">
          Subir foto (Próximamente)
        </Text>
      </View>

      <View className="gap-6">
        <View>
          <Text className="text-neutral-400 font-semibold mb-2 ml-1">
            Nombre de usuario (único)
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="@tu_usuario"
            placeholderTextColor={colors.neutral[600]}
            className="bg-neutral-800 text-white p-4 rounded-2xl text-lg border border-neutral-700"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-neutral-400 font-semibold mb-2 ml-1">
            Apodo (Opcional)
          </Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Ej. Bestia"
            placeholderTextColor={colors.neutral[600]}
            className="bg-neutral-800 text-white p-4 rounded-2xl text-lg border border-neutral-700"
          />
        </View>
      </View>

      <View className="flex-1 justify-end pb-12 gap-4">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={loading || !username}
          className={`p-4 rounded-2xl items-center ${username ? "bg-emerald-500" : "bg-neutral-700"}`}
        >
          <Text
            className={`${username ? "text-neutral-900" : "text-neutral-500"} font-black text-lg`}
          >
            Continuar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} className="p-4 items-center">
          <Text className="text-neutral-500 font-semibold text-base">
            Hacerlo más tarde
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
