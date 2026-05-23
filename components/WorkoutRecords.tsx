import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import EXERCISES from "@/constants/Exercises";
import { Workout } from "@/types/Workout";
import { capitalize } from "@/utils/text";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

interface Props {
  date: Date;
  workout?: Workout;
}

export default function WorkoutRecords({ date, workout }: Props) {
  const navigation = useNavigation<any>();
  const workoutSession = useWorkoutsHistoryStore((s) =>
    s.getWorkoutSession(date.toISOString()),
  );

  const handleRegisterWorkoutSession = () => {
    navigation.navigate("workoutSession", { date: date });
  };

  const hasSets = workoutSession?.sets && workoutSession.sets.length > 0;
  const isCompleted = workoutSession?.status === "completed";

  // Sin completar y sin registros
  if (!hasSets && !isCompleted) {
    return (
      <TouchableOpacity
        onPress={handleRegisterWorkoutSession}
        className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed flex-1 items-center justify-center h-44"
      >
        <Ionicons
          name="fitness-outline"
          size={32}
          color={colors.neutral[400]}
        />
        <Text className="text-neutral-400 font-medium text-lg">
          Agregar entreno
        </Text>
      </TouchableOpacity>
    );
  }

  // Completado pero sin registros
  if (!hasSets)
    return (
      <TouchableOpacity
        onPress={handleRegisterWorkoutSession}
        className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-green-900 border-solid bg-green-950/25 flex-1 items-center justify-center h-44"
      >
        <View className="absolute top-5 right-5">
          <Ionicons name="create-outline" color={colors.green[500]} size={16} />
        </View>

        <Ionicons name="fitness-outline" size={32} color={colors.green[500]} />
        <Text className="text-green-500 font-medium text-lg">
          Entreno completado
        </Text>

        <View className="flex-row items-center gap-0.5 mt-0.5">
          <Ionicons name="time-outline" size={12} color={colors.neutral[400]} />
          <Text className="text-neutral-400 font-medium text-sm">17:42</Text>
        </View>
      </TouchableOpacity>
    );

  // Completado y con registros
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={handleRegisterWorkoutSession}
      className="border-1.5 border-neutral-200 bg-green-950/25 overflow-hidden border-solid dark:border-green-900 rounded-xl"
    >
      <View className="flex-row items-center gap-1 justify-between p-5">
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="fitness-outline"
            size={16}
            color={colors.green[500]}
          />
          <Text className="font-medium text-green-500">Entreno completado</Text>
        </View>

        <Ionicons name="create-outline" color={colors.green[500]} size={16} />
      </View>

      <View className="gap-px">
        {workoutSession.sets.map((set: any, index: number) => (
          <Set key={set.id} set={set} index={index} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

const Set = ({ set, index }: { set: any; index: number }) => {
  const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

  if (!exercise) return <Text key={set.id}>No se encontro el ejercicio</Text>;

  const weightUnit = useGlobalSettingsStore((s) => s.weightUnit);

  const hasMetrics = set.weight || set.reps || set.rir;
  const hasDropsets = set.dropSets && set.dropSets.length > 0;

  console.log(set);

  return (
    <View key={set.id} className="dark:bg-green-950/50 p-5">
      <View className="flex-row items-center gap-2">
        {/* <View className="size-6 rounded-full border border-green-700 items-center justify-center">
          <Text className="dark:text-green-500 text-xs">{index + 1}</Text>
        </View> */}

        <Text className="dark:text-white font-medium">
          {capitalize(exercise.name)}
        </Text>
      </View>

      {hasMetrics && (
        <View className="flex-row gap-1 items-center mt-2 justify-evenly">
          {set.weight && (
            <View className="flex-1 bg-green-950 p-2 rounded-md">
              <Text className="text-lg text-center font-medium text-green-500">
                {set.weight} {weightUnit}
              </Text>
            </View>
          )}
          {set.reps && (
            <View className="flex-1 bg-green-950 p-2 rounded-md">
              <Text className="text-lg text-center font-medium text-green-500">
                x {set.reps}
              </Text>
            </View>
          )}
          {set.rir && (
            <View className="flex-1 bg-green-950 p-2 rounded-md">
              <Text className="text-lg text-center font-medium text-green-500">
                rir {set.rir}
              </Text>
            </View>
          )}
        </View>
      )}

      {hasDropsets && (
        <View className="gap-1 mt-2">
          {set.dropSets.map((dropSet: any, dIndex: number) => (
            <View
              className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3"
              key={dropSet.id}
            >
              <Text className="dark:text-white">Dropset {dIndex + 1}</Text>
              <Text className="flex-1 text-center dark:text-white">
                weight:{dropSet.weight} reps:{dropSet.reps}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
