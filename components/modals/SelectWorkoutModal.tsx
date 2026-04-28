import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useModalStore } from "@/stores/useModalStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { Workout } from "@/types/Workout";
import colors from "tailwindcss/colors";

export function SelectWorkoutModal({
  onSelectWorkout,
  excludeId,
  templateOnly,
  hideTemplate,
}: {
  onSelectWorkout: (workout: Workout, asTemplate: boolean) => void;
  excludeId?: string;
  templateOnly?: boolean;
  hideTemplate?: boolean;
}) {
  const workouts = useWorkoutsStore((s) => s.workouts);
  const routines = useRoutinesStore((s) => s.routines);
  const hideModal = useModalStore((s) => s.hideModal);

  const filteredWorkouts = workouts.filter((w) => w.id !== excludeId);

  return (
    <View className="flex-1 bg-white rounded-t-3xl p-5 gap-4">
      <Text className="text-xl font-bold">Seleccionar Entrenamiento</Text>
      
      {filteredWorkouts.length === 0 ? (
        <Text className="text-neutral-500">No hay otros entrenamientos creados o disponibles para elegir.</Text>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-3">
          {filteredWorkouts.map((workout) => (
            <View key={workout.id} className="border border-neutral-200 rounded-xl p-3 flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="font-bold text-lg">{workout.name || "Entrenamiento sin nombre"}</Text>
                <Text className="text-neutral-500 text-xs">{workout.steps.length} ejercicios/series</Text>
                <Text className="text-neutral-400 text-[10px]" numberOfLines={1}>
                  {routines.filter((r) => r.days.some((d) => d.workoutId === workout.id)).length > 0
                    ? `Uso: ${routines
                        .filter((r) => r.days.some((d) => d.workoutId === workout.id))
                        .map((r) => r.name || "Sin nombre")
                        .join(", ")}`
                    : "Sin uso"}
                </Text>
              </View>
              
              {!templateOnly && (
                <TouchableOpacity
                  onPress={() => {
                    onSelectWorkout(workout, false);
                    hideModal();
                  }}
                  className="bg-neutral-100 px-3 py-2 rounded-lg"
                >
                  <Text className="font-medium text-neutral-800">Usar</Text>
                </TouchableOpacity>
              )}
              
              {!hideTemplate && (
                <TouchableOpacity
                  onPress={() => {
                    onSelectWorkout(workout, true);
                    hideModal();
                  }}
                  className="bg-neutral-800 px-3 py-2 rounded-lg flex-row items-center gap-1"
                >
                  <Ionicons name="copy-outline" size={16} color="white" />
                  <Text className="font-medium text-white">Plantilla</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
