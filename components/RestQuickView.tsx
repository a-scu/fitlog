import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { es } from "date-fns/locale";
import { Image } from "expo-image";
import { format } from "date-fns";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";

export default function RestQuickView({
  routineId,
  date,
}: {
  routineId: string;
  date: Date;
}) {
  const navigation = useNavigation();
  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const workoutSession = useWorkoutsHistoryStore((s) =>
    s.getWorkoutSession(date),
  );

  const handleFreeWorkout = () => {
    Alert.alert(
      "¿Estás seguro que deseas realizar un entreno libre?",
      "Hoy te toca descanso :(",
      [
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
      ],
    );
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("routine", { routineId })}
      className="border border-neutral-200 dark:border-neutral-800 p-5 rounded-xl"
    >
      {/*  */}
      <View className="flex-row items-start justify-between flex-1">
        <Text className="text-neutral-500 text-sm">Hoy</Text>

        <View className="justify-end items-center flex-row gap-1">
          <Text className="text-neutral-400 text-end text-sm">Ver detalle</Text>
          <Ionicons
            name="enter-outline"
            className="!text-sm !leading-none"
            color={colors.neutral[400]}
          />
        </View>
      </View>

      <Text className="text-neutral-500 dark:text-neutral-400 text-xl">
        Descanso
        <Text className="text-neutral-500 dark:text-neutral-400 text-base font-medium">
          {" - "}
          {format(date, "d 'de' MMMM", { locale: es })}
        </Text>
      </Text>

      <View className="size-48 self-center">
        <Image
          source={
            "https://png.pngtree.com/png-clipart/20231222/original/pngtree-blissful-rest-cartoon-bear-relishing-lazy-hammock-afternoon-png-image_13912197.png"
          }
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </View>

      {workoutSession?.status !== "completed" && (
        <TouchableOpacity
          onPress={handleFreeWorkout}
          className="flex-row items-center border rounded-xl border-neutral-200 dark:border-neutral-800 p-3 gap-1 justify-center"
        >
          <Text className="text-neutral-400">Realizar entreno libre</Text>
          <Ionicons
            name="barbell-outline"
            className="!text-sm !leading-none"
            color={colors.neutral[400]}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
