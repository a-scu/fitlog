import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/stores/UserStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

type ScreenStep = "methods" | "phone" | "code";

export default function WelcomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithPhoneNumber,
    confirmPhoneNumberCode,
    loading,
  } = useUserStore();
  const setHasCompletedOnboarding = useGlobalSettingsStore(
    (s) => s.setHasCompletedOnboarding,
  );

  const [step, setStep] = useState<ScreenStep>("methods");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);

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
      Alert.alert("Error", "No se pudo iniciar sesión con Google.");
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
      Alert.alert("Error", "No se pudo iniciar sesión con Apple.");
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Por favor ingresa un número de teléfono válido.");
      return;
    }
    try {
      const confirmResult = await signInWithPhoneNumber(phoneNumber.trim());
      setConfirmation(confirmResult);
      setStep("code");
    } catch (e: any) {
      console.log(e);
      Alert.alert(
        "Error",
        `No se pudo enviar el código de verificación.\n\n${e.message || e.toString()}`,
      );
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length < 6) {
      Alert.alert("Error", "Por favor ingresa el código de 6 dígitos.");
      return;
    }
    try {
      const { isNewUser } = await confirmPhoneNumberCode(
        confirmation,
        code.trim(),
      );
      if (isNewUser) {
        navigation.navigate("profileSetup");
      } else {
        setHasCompletedOnboarding(true);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "El código ingresado no es válido o ha expirado.");
    }
  };

  return (
    <>
      <View
        className="flex-1 bg-neutral-950 justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        {/* Back Button for phone/code steps */}
        {step !== "methods" && (
          <TouchableOpacity
            onPress={() => setStep(step === "code" ? "phone" : "methods")}
            className="absolute top-14 left-6 p-2 bg-neutral-800 rounded-full border border-neutral-700"
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {step === "methods" && (
          <>
            <View className="flex-1 justify-center items-center">
              <Ionicons name="barbell" size={80} color={colors.emerald[400]} />
              <Text className="text-white text-5xl font-black mt-6 tracking-tighter">
                Fitlog
              </Text>
              <Text className="text-neutral-400 text-lg mt-2 text-center">
                Registra y domina tus entrenamientos.
              </Text>
            </View>

            <View className="gap-4 pb-12">
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={loading}
                className="bg-white p-4 rounded-2xl flex-row items-center justify-center gap-3 min-h-[60px]"
              >
                <Ionicons
                  name="logo-google"
                  size={24}
                  color={colors.neutral[800]}
                />
                <Text className="text-neutral-900 font-bold text-lg">
                  Continuar con Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAppleSignIn}
                disabled={loading}
                className="bg-neutral-800 p-4 rounded-2xl flex-row items-center justify-center gap-3 border border-neutral-700 min-h-[60px]"
              >
                <Ionicons name="logo-apple" size={24} color={colors.white} />
                <Text className="text-white font-bold text-lg">
                  Continuar con Apple
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep("phone")}
                disabled={loading}
                className="bg-emerald-500 p-4 rounded-2xl flex-row items-center justify-center gap-3 min-h-[60px]"
              >
                <Ionicons name="call" size={24} color={colors.neutral[900]} />
                <Text className="text-neutral-900 font-bold text-lg">
                  Continuar con Teléfono
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === "phone" && (
          <View className="flex-1 justify-center">
            <Text className="text-white text-3xl font-black mb-2 tracking-tight">
              Tu número de teléfono
            </Text>
            <Text className="text-neutral-400 text-base mb-6">
              Te enviaremos un código SMS para verificar tu cuenta.
            </Text>

            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+34 600 000 000"
              placeholderTextColor={colors.neutral[600]}
              keyboardType="phone-pad"
              autoFocus
              className="bg-neutral-800 text-white p-4 rounded-2xl text-lg border border-neutral-700 w-full mb-2"
            />
            <Text className="text-neutral-500 text-xs mb-6 px-1">
              Recuerda incluir el código de tu país (ej: +54, +34, +1, +52).
            </Text>

            <TouchableOpacity
              onPress={handleSendCode}
              disabled={loading || !phoneNumber.trim()}
              className={`p-4 rounded-2xl items-center min-h-[60px] justify-center ${
                phoneNumber.trim()
                  ? "bg-emerald-500"
                  : "bg-neutral-800 border border-neutral-700"
              }`}
            >
              <Text
                className={`${phoneNumber.trim() ? "text-neutral-900" : "text-neutral-500"} font-bold text-lg`}
              >
                Enviar Código
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "code" && (
          <View className="flex-1 justify-center">
            <Text className="text-white text-3xl font-black mb-2 tracking-tight">
              Código de verificación
            </Text>
            <Text className="text-neutral-400 text-base mb-6">
              Ingresa el código de 6 dígitos enviado a {phoneNumber}.
            </Text>

            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={colors.neutral[600]}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              className="bg-neutral-800 text-white p-4 rounded-2xl text-lg border border-neutral-700 w-full mb-6 text-center tracking-[12px] font-bold"
            />

            <TouchableOpacity
              onPress={handleVerifyCode}
              disabled={loading || code.length < 6}
              className={`p-4 rounded-2xl items-center min-h-[60px] justify-center ${
                code.length === 6
                  ? "bg-emerald-500"
                  : "bg-neutral-800 border border-neutral-700"
              }`}
            >
              <Text
                className={`${code.length === 6 ? "text-neutral-900" : "text-neutral-500"} font-bold text-lg`}
              >
                Verificar Código
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && (
        <View className="absolute inset-0 bg-neutral-950/60 justify-center items-center z-50">
          <View className="bg-neutral-800 p-6 rounded-3xl items-center justify-center shadow-xl border border-neutral-700 gap-4">
            <ActivityIndicator size="large" color={colors.emerald[400]} />
            <Text className="text-white font-bold">Procesando...</Text>
          </View>
        </View>
      )}
    </>
  );
}
