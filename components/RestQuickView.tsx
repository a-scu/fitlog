import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

import { es } from "date-fns/locale";

import colors from "tailwindcss/colors";

import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";

export default function RestQuickView({ routineId, date }: { routineId: string; date: Date }) {
  const navigation = useNavigation();
  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const handleFreeWorkout = () => {
    startWorkout("free", routineId);
    navigation.navigate("workoutSession", {
      date: new Date().toISOString(),
    });
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("routine", { routineId })}
      className="border border-neutral-200 p-5 rounded-xl"
    >
      {/*  */}
      <View className="flex-row items-start justify-between flex-1">
        <Text className="text-neutral-500 text-sm">Hoy</Text>

        <View className="justify-end items-center flex-row gap-1">
          <Text className="text-neutral-400 text-end text-sm">Ver detalle</Text>
          <Ionicons name="enter-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
        </View>
      </View>

      <Text className="text-neutral-500 text-xl">
        Descanso
        <Text className="text-neutral-500 text-base font-medium">
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

      <TouchableOpacity
        onPress={handleFreeWorkout}
        className="flex-row items-center border rounded-xl border-neutral-200 p-3 gap-1 justify-center"
      >
        <Text className="text-neutral-400">Realizar entreno libre</Text>
        <Ionicons name="barbell-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
