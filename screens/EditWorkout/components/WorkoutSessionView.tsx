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
        <Pressable key={workoutSession.id} onPress={handleRegisterWorkoutSession} className="flex-1 gap-3">
          {workoutSession.sets.map((set, index) => {
            const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

            if (!exercise) return <Text>No se encontro el ejercicio</Text>;

            return (
              <View className="border rounded-xl p-3">
                <Text>Set {index + 1}</Text>
                <Text>{exercise.name}</Text>

                <View className="flex-row gap-3 items-center justify-evenly mb-3">
                  {set.weight && <Text className="text-lg">weight: {set.weight}</Text>}
                  {set.reps && <Text className="text-lg">reps: {set.reps}</Text>}
                  {set.rir && <Text className="text-lg">rir: {set.rir}</Text>}
                </View>

                {set.dropSets && set.dropSets.length > 0 && (
                  <View className="gap-1">
                    {set.dropSets.map((dropSet, index) => {
                      return (
                        <View className="flex-row border rounded-xl p-3" key={dropSet.id}>
                          <Text>Dropset {index + 1}</Text>

                          <Text className="flex-1 text-center">
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
          className="rounded-2xl w-full border-1.5 border-neutral-200 border-dashed flex-1 items-center justify-center gap-2.5"
        >
          <Ionicons name="fitness-outline" size={29} color={colors.neutral[400]} />
          <Text className="text-green-500 text-lg">Entreno completado!</Text>
          <Text className="text-neutral-400 font-semibold text-lg">Agregar registros</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleRegisterWorkoutSession}
          className="rounded-2xl w-full border-1.5 border-neutral-200 border-dashed flex-1 items-center justify-center gap-2.5"
        >
          <Ionicons name="fitness-outline" size={29} color={colors.neutral[400]} />
          <Text className="text-neutral-400 font-semibold text-lg">Agregar entreno</Text>
        </TouchableOpacity>
      )}

      {!workoutSession || !workoutSession.notes ? (
        <TouchableOpacity
          className="rounded-2xl w-full border-1.5 border-neutral-200 border-dashed flex-1 items-center justify-center gap-2.5"
          onPress={handleAddNotes}
        >
          <Ionicons name="text-outline" size={28} color={colors.neutral[400]} />
          <Text className="text-neutral-400 font-semibold text-lg">Agregar notas</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleAddNotes} className="border-neutral-200 border rounded-2xl p-5 min-h-52">
          <Text className="text-neutral-500 font-medium">Notas</Text>
          <View className="mt-4">
            <Text className="text-neutral-800">{workoutSession.notes}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
