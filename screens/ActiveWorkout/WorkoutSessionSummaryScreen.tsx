import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutSessionSummaryScreen({ route }: any) {
  const insets = useSafeAreaInsets();
  const { workoutSessionDate } = route.params || {};

  return (
    <View className="flex-1 bg-white p-4" style={{ paddingTop: insets.top }}>
      <Text className="text-2xl font-bold mb-4 text-center">Resumen del Entreno</Text>
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-500 italic text-center">
          ¡Entrenamiento finalizado con éxito!
        </Text>
        <Text className="text-neutral-400 mt-2">
          Fecha: {workoutSessionDate}
        </Text>
      </View>
    </View>
  );
}
