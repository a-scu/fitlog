import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Workout } from "@/types/Workout";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useModalStore } from "@/stores/ModalStore";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { randomId } from "@/utils/random";

export default function WorkoutsScreen({ navigation }: any) {
  const workouts = useWorkoutsStore((state) => state.workouts);
  const addWorkout = useWorkoutsStore((state) => state.addWorkout);
  const deleteAllWorkouts = useWorkoutsStore(
    (state) => state.deleteAllWorkouts,
  );
  const showModal = useModalStore((s) => s.showModal);

  console.log("Workouts", workouts);

  const handleCreatWorkout = () => {
    navigation.navigate("createWorkout");
  };

  const handleDeleteAll = () => {
    showModal({
      snapPoints: ["40%"],
      content: (
        <ConfirmationModal
          title="¿Eliminar todos los entrenos?"
          description="Esta acción no se puede deshacer. Se eliminarán todos tus entrenos guardados."
          onConfirm={deleteAllWorkouts}
          confirmText="Eliminar todos"
          type="danger"
        />
      ),
    });
  };

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <ScrollView contentContainerClassName="p-4 gap-4 flex-1">
        <TouchableOpacity
          onPress={handleCreatWorkout}
          className="p-6 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl items-center justify-center flex-row gap-2"
        >
          <Ionicons name="add-circle-outline" size={24} color="#10b981" />
          <Text className="text-neutral-900 dark:text-white font-bold text-lg">
            Crear Entreno
          </Text>
        </TouchableOpacity>

        {workouts.length > 0 ? (
          <TouchableOpacity
            onPress={handleDeleteAll}
            className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Ionicons name="trash-bin-outline" size={18} color="#ef4444" />
            <Text className="text-red-600 dark:text-red-500 font-medium">
              Eliminar todos los entrenos
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="items-center py-6">
            <Text className="text-neutral-400 dark:text-neutral-500">
              No hay entrenos guardados
            </Text>
          </View>
        )}

        <View className="gap-3">
          {Array.from(new Map(workouts.map((r) => [r.id, r])).values()).map(
            (workout, index) => (
              <WorkoutItem key={workout.id} index={index} workout={workout} />
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const WorkoutItem = ({
  workout,
  index,
}: {
  workout: Workout;
  index: number;
}) => {
  const navigation = useNavigation();
  const deleteWorkout = useWorkoutsStore((state) => state.deleteWorkout);
  const routines = useRoutinesStore((s) => s.routines);
  const showModal = useModalStore((s) => s.showModal);

  const handleNavigate = () => {
    navigation.navigate("editWorkout", { workoutId: workout.id });
  };

  const handleDelete = () => {
    const routinesUsingWorkout = routines.filter((r) =>
      r.days.some((d) => d.workoutId === workout.id),
    );

    if (routinesUsingWorkout.length > 0) {
      const routineNames = routinesUsingWorkout
        .map((r) => r.name || "Sin nombre")
        .join(", ");
      showModal({
        snapPoints: ["45%"],
        content: (
          <ConfirmationModal
            title="¿Eliminar entreno en uso?"
            description={`Este entreno se está usando en las siguientes rutinas: ${routineNames}. Si lo eliminas, desaparecerá de esas rutinas.`}
            onConfirm={() => deleteWorkout(workout.id)}
            confirmText="Eliminar"
            type="danger"
          />
        ),
      });
    } else {
      deleteWorkout(workout.id);
    }
  };

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={handleNavigate}
        className="p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl flex-1 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-1">
          <Text className="font-bold text-neutral-900 dark:text-white text-base mb-1">
            {workout.name || `Entreno ${index + 1}`}
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            {workout.steps.length} ejercicios/series
          </Text>
          <Text
            className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-2"
            numberOfLines={1}
          >
            {routines.filter((r) =>
              r.days.some((d) => d.workoutId === workout.id),
            ).length > 0
              ? `En uso en: ${routines
                  .filter((r) => r.days.some((d) => d.workoutId === workout.id))
                  .map((r) => r.name || "Sin nombre")
                  .join(", ")}`
              : "No se está usando en ninguna rutina"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDelete}
        className="p-4 border border-red-200 dark:border-red-900/30 bg-white dark:bg-neutral-800 rounded-2xl items-center justify-center shadow-sm"
      >
        <Ionicons name="trash-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};
