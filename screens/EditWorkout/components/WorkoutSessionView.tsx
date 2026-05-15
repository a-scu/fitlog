import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { isSameDay } from "date-fns";

import EXERCISES from "@/assets/data/exercises.json";

export default function WorkoutSessionView({ date }: any) {
  const navigation = useNavigation();

  const workoutSession = useWorkoutsHistoryStore((s) => s.workoutSessions.find((s) => isSameDay(s.date, date)));

  console.log("workoutSessionview", workoutSession);

  const handleRegisterWorkoutSession = () => {
    navigation.navigate("workoutSession", { date: date.toISOString() });
  };

  const handleAddNotes = () => {
    navigation.navigate("addNote", { date: date.toISOString() });
  };

  return (
    <View className="flex-1 gap-3">
      {workoutSession && workoutSession?.sets?.length > 0 ? (
        <Pressable
          key={workoutSession.id}
          onPress={handleRegisterWorkoutSession}
          className="flex-1 gap-3 border p-3 border-neutral-200 dark:border-neutral-800 rounded-xl"
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-neutral-500">Editar registros</Text>
            <Ionicons name="create-outline" color={colors.neutral[500]} />
          </View>

          {workoutSession.sets.map((set, index) => {
            const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

            if (!exercise) return <Text>No se encontro el ejercicio</Text>;

            return (
              <View className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3">
                <Text className="dark:text-white">Set {index + 1}</Text>
                <Text className="dark:text-white">{exercise.name}</Text>

                <View className="flex-row gap-3 items-center justify-evenly mb-3">
                  {set.weight && <Text className="text-lg dark:text-white">weight: {set.weight}</Text>}
                  {set.reps && <Text className="text-lg dark:text-white">reps: {set.reps}</Text>}
                  {set.rir && <Text className="text-lg dark:text-white">rir: {set.rir}</Text>}
                </View>

                {set.dropSets && set.dropSets.length > 0 && (
                  <View className="gap-1">
                    {set.dropSets.map((dropSet, index) => {
                      return (
                        <View className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3" key={dropSet.id}>
                          <Text className="dark:text-white">Dropset {index + 1}</Text>

                          <Text className="flex-1 text-center dark:text-white">
                            weight:{dropSet.weight} reps:{dropSet.reps}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </Pressable>
      ) : workoutSession && workoutSession.status === "completed" ? (
        <TouchableOpacity
          onPress={handleRegisterWorkoutSession}
          className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed flex-1 items-center justify-center gap-2.5"
        >
          <Ionicons name="fitness-outline" size={29} color={colors.neutral[400]} />
          <Text className="text-green-500 text-lg">Entreno completado!</Text>
          <Text className="text-neutral-400 font-semibold text-lg">Agregar registros</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleRegisterWorkoutSession}
          className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed flex-1 items-center justify-center gap-2.5 min-h-[120px]"
        >
          <Ionicons name="fitness-outline" size={29} color={colors.neutral[400]} />
          <Text className="text-neutral-400 font-semibold text-lg">Agregar entreno</Text>
        </TouchableOpacity>
      )}

      {!workoutSession || !workoutSession.notes ? (
        <TouchableOpacity
          className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed flex-1 items-center justify-center gap-2.5 min-h-[120px]"
          onPress={handleAddNotes}
        >
          <Ionicons name="text-outline" size={28} color={colors.neutral[400]} />
          <Text className="text-neutral-400 font-semibold text-lg">Agregar notas</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleAddNotes} className="border-neutral-200 dark:border-neutral-800 border rounded-2xl p-5 min-h-52">
          <Text className="text-neutral-500 dark:text-neutral-400 font-medium">Notas</Text>
          <View className="mt-4">
            <Text className="text-neutral-800 dark:text-neutral-300">{workoutSession.notes}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
