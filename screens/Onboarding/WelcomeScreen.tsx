import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/UserStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

export default function WelcomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, signInWithApple, loading } = useUserStore();
  const setHasCompletedOnboarding = useGlobalSettingsStore((s) => s.setHasCompletedOnboarding);

  const handleGoogleSignIn = async () => {
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        navigation.navigate("profileSetup");
      } else {
        setHasCompletedOnboarding(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const { isNewUser } = await signInWithApple();
      if (isNewUser) {
        navigation.navigate("profileSetup");
      } else {
        setHasCompletedOnboarding(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSkip = () => {
    navigation.navigate("tour");
  };

  return (
    <>
      <View className="flex-1 bg-neutral-900 justify-center px-6" style={{ paddingTop: insets.top }}>
        <View className="flex-1 justify-center items-center">
          <Ionicons name="barbell" size={80} color={colors.emerald[400]} />
          <Text className="text-white text-5xl font-black mt-6 tracking-tighter">Fitlog</Text>
          <Text className="text-neutral-400 text-lg mt-2 text-center">Registra y domina tus entrenamientos.</Text>
        </View>

        <View className="gap-4 pb-12">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="bg-white p-4 rounded-2xl flex-row items-center justify-center gap-3 min-h-[60px]"
          >
            <Ionicons name="logo-google" size={24} color={colors.neutral[800]} />
            <Text className="text-neutral-900 font-bold text-lg">Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAppleSignIn}
            disabled={loading}
            className="bg-neutral-800 p-4 rounded-2xl flex-row items-center justify-center gap-3 border border-neutral-700 min-h-[60px]"
          >
            <Ionicons name="logo-apple" size={24} color={colors.white} />
            <Text className="text-white font-bold text-lg">Continuar con Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} disabled={loading} className="mt-4 p-4 items-center">
            <Text className="text-neutral-500 font-semibold text-base">Saltar por ahora</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View className="absolute inset-0 bg-neutral-900/60 justify-center items-center z-50">
          <View className="bg-neutral-800 p-6 rounded-3xl items-center justify-center shadow-xl border border-neutral-700 gap-4">
            <ActivityIndicator size="large" color={colors.emerald[400]} />
            <Text className="text-white font-bold">Iniciando sesión...</Text>
          </View>
        </View>
      )}
    </>
  );
}
