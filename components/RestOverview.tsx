import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { es } from "date-fns/locale";
import { Image } from "expo-image";
import { format } from "date-fns";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";

export default function RestOverview({ date }: { date: Date }) {
  const navigation = useNavigation();
  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const routineId = useWorkspacesStore((s) => s.personalWorkspace?.routineId);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date));

  const handleFreeWorkout = () => {
    Alert.alert("¿Estás seguro que deseas realizar un entreno libre?", "Hoy te toca descanso :(", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí",
        onPress: () => {
          startWorkout("free", routineId);
          navigation.navigate("workoutSession", {
            date: new Date().toISOString(),
          });
        },
      },
    ]);
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate("routine", { routineId })} className="grow">
      {/* <View className="top-5 right-5 absolute">
        <Ionicons name="create-outline" size={16} color={colors.indigo[500]} />
      </View> */}

      <View className="flex-row items-center gap-1">
        <Ionicons name="bed-outline" size={16} color={colors.indigo[500]} />
        <Text className="text-indigo-500 dark:text-indigo-500 text-lg font-medium">Descanso</Text>
      </View>

      <View className="size-44 self-center my-auto">
        <Image
          source={require("@/assets/images/etc/threatning-bear-sleeping.png")}
          style={{
            width: "100%",
            height: "100%",
          }}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
}
