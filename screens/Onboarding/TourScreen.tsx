import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

export default function TourScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const setHasCompletedOnboarding = useGlobalSettingsStore(
    (s) => s.setHasCompletedOnboarding,
  );

  const handleFinish = () => {
    setHasCompletedOnboarding(true);
  };

  const handleStartTour = () => {
    // In the future: do actual tour steps
    setHasCompletedOnboarding(true);
  };

  return (
    <View
      className="flex-1 bg-neutral-950 justify-center px-6"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1 justify-center items-center">
        <View className="w-24 h-24 bg-blue-500/20 rounded-full items-center justify-center mb-6">
          <Ionicons name="map" size={48} color={colors.blue[400]} />
        </View>
        <Text className="text-white text-3xl font-black mb-4 text-center tracking-tight">
          ¿Quieres un recorrido?
        </Text>
        <Text className="text-neutral-400 text-center text-lg leading-relaxed px-4">
          Podemos mostrarte cómo crear tu primera rutina y empezar a registrar
          tus entrenamientos.
        </Text>
      </View>

      <View className="gap-4 pb-12">
        <TouchableOpacity
          onPress={handleStartTour}
          className="bg-blue-500 p-4 rounded-2xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            Sí, mostrar recorrido
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFinish}
          className="bg-neutral-800 p-4 rounded-2xl items-center border border-neutral-700"
        >
          <Text className="text-white font-bold text-lg">
            No, ya sé cómo usarlo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
