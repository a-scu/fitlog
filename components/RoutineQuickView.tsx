import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Routine } from "@/types/Routine";

import { dayNames } from "@/constants/DayNames";

export default function RoutineQuickView({ routine }: { routine: Routine }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("routine", { routineId: routine.id })}
      className="border border-neutral-200 rounded-xl p-5"
    >
      <View className="flex-row items-start justify-between flex-1">
        <Text className="text-neutral-500 text-sm">Rutina</Text>

        <View className="justify-end flex-row gap-1 flex-1">
          <Text className="text-neutral-400 text-end text-sm">Editar rutina</Text>
          <Ionicons name="create-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
        </View>
      </View>

      <Text className="font-bold text-xl mb-0.5">{routine.name || "Rutina sin nombre"}</Text>

      <View className="flex-row gap-3">
        {routine.days.map((day) => (
          <Text key={day.dayIndex} className={`${day.isRestDay ? "text-neutral-400" : "text-green-500"}`}>
            {dayNames[day.dayIndex].slice(0, 1).toUpperCase()}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}
