import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { Alert } from "react-native";
import { isSameDay } from "date-fns";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import EXERCISES from "@/constants/Exercises";
import { Workout } from "@/types/Workout";

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

  if (!hasSets && !isCompleted) {
    return (
      <TouchableOpacity
        onPress={handleRegisterWorkoutSession}
        className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed flex-1 items-center justify-center gap-2.5 h-44"
      >
        <Ionicons
          name="fitness-outline"
          size={29}
          color={colors.neutral[400]}
        />
        <Text className="text-neutral-400 font-semibold text-lg">
          Agregar entreno
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed flex-1 p-3 gap-2.5">
      {!hasSets ? (
        <TouchableOpacity
          onPress={handleRegisterWorkoutSession}
          className="w-full border-neutral-200 dark:border-neutral-700 flex-1 items-center justify-center gap-2.5 py-8"
        >
          <Ionicons
            name="fitness-outline"
            size={29}
            color={colors.neutral[400]}
          />
          <Text className="text-green-500 text-lg">Entreno completado!</Text>
          <Text className="text-neutral-400 font-semibold text-lg">
            Agregar registros
          </Text>
        </TouchableOpacity>
      ) : (
        <Pressable
          onPress={handleRegisterWorkoutSession}
          className="flex-1 gap-3 border p-3 border-neutral-200 dark:border-neutral-800 rounded-xl"
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-neutral-500">Editar registros</Text>
            <Ionicons name="create-outline" color={colors.neutral[500]} />
          </View>

          {workoutSession.sets.map((set: any, index: number) => {
            const exercise = EXERCISES.find(
              (e) => e.exerciseId === set.exerciseId,
            );
            if (!exercise)
              return <Text key={set.id}>No se encontro el ejercicio</Text>;

            return (
              <View
                key={set.id}
                className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3"
              >
                <Text className="dark:text-white">Set {index + 1}</Text>
                <Text className="dark:text-white">{exercise.name}</Text>
                <View className="flex-row gap-3 items-center justify-evenly mb-3">
                  {set.weight !== undefined && (
                    <Text className="text-lg dark:text-white">
                      weight: {set.weight}
                    </Text>
                  )}
                  {set.reps !== undefined && (
                    <Text className="text-lg dark:text-white">
                      reps: {set.reps}
                    </Text>
                  )}
                  {set.rir !== undefined && (
                    <Text className="text-lg dark:text-white">
                      rir: {set.rir}
                    </Text>
                  )}
                </View>
                {set.dropSets && set.dropSets.length > 0 && (
                  <View className="gap-1">
                    {set.dropSets.map((dropSet: any, dIndex: number) => (
                      <View
                        className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3"
                        key={dropSet.id}
                      >
                        <Text className="dark:text-white">
                          Dropset {dIndex + 1}
                        </Text>
                        <Text className="flex-1 text-center dark:text-white">
                          weight:{dropSet.weight} reps:{dropSet.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </Pressable>
      )}
    </View>
  );
}
