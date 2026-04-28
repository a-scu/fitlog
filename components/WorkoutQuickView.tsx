import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Step, Workout } from "@/types/Workout";

import { dayNames } from "@/constants/DayNames";

import { getRoutineMuscles } from "@/utils/routineMuscles";
import { adjustedDay, monthDay } from "@/constants/Time";

interface Props {
  workout: Workout;
  canEdit?: boolean;
  canStart?: boolean;
}

export default function WorkoutQuickView({ workout, canEdit = true, canStart = true }: Props) {
  const navigation = useNavigation();

  const sets = workout.steps.filter((s: Step) => s.type !== "rest");

  console.log("Sets", sets);

  const { target, secondary } = getRoutineMuscles(sets);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("workout", { workoutId: workout.id })}
      className="flex-1 p-5 rounded-xl border flex-row border-neutral-200 gap-5"
    >
      <View className="flex-1">
        <Text className="text-neutral-500 text-sm">Entreno de hoy</Text>

        <Text className="font-bold text-xl">
          {workout?.name}
          <Text className="text-neutral-500 text-base font-medium">
            {" - "}
            {dayNames[adjustedDay]} {monthDay}
          </Text>
        </Text>

        <Text className="text-neutral-500 text-sm mb-3">{target.join(", ")}</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("editWorkout", { workoutId: workout.id })}
          className="border flex-row p-3 border-neutral-200 rounded-lg justify-center gap-1"
        >
          <Text className="text-neutral-400 text-end text-sm">Editar entreno</Text>
          <Ionicons name="create-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
        </TouchableOpacity>
      </View>

      <View className="gap-3 justify-between">
        <View className="justify-end items-center flex-row gap-1">
          <Text className="text-neutral-400 text-end text-sm">Ver entreno</Text>
          <Ionicons name="enter-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("activeWorkout", { workoutId: workout.id })}
          className="p-3 aspect-square bg-green-50 border-green-200 border rounded-xl items-center justify-center"
        >
          <Ionicons name="play-outline" size={20} color={colors.green[500]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
