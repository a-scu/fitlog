import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Workout } from "@/types/Workout";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useModalStore } from "@/stores/useModalStore";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { randomId } from "@/utils/random";

export default function WorkoutsScreen({ navigation }: any) {
  const workouts = useWorkoutsStore((state) => state.workouts);
  const addWorkout = useWorkoutsStore((state) => state.addWorkout);
  const deleteAllWorkouts = useWorkoutsStore((state) => state.deleteAllWorkouts);
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
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-3 gap-3">
        <TouchableOpacity onPress={handleCreatWorkout} className="p-6 border rounded-md">
          <Text>Crear entreno</Text>
        </TouchableOpacity>

        {workouts.length > 0 ? (
          <TouchableOpacity onPress={handleDeleteAll} className="border p-3 rounded-lg">
            <Text className="text-center">Eliminar todas las entrenos</Text>
          </TouchableOpacity>
        ) : (
          <Text>No hay entrenos</Text>
        )}

        {Array.from(new Map(workouts.map((r) => [r.id, r])).values()).map((workout, index) => (
          <WorkoutItem key={workout.id} index={index} workout={workout} />
        ))}
      </ScrollView>
    </View>
  );
}

const WorkoutItem = ({ workout, index }: { workout: Workout; index: number }) => {
  const navigation = useNavigation();
  const deleteWorkout = useWorkoutsStore((state) => state.deleteWorkout);
  const routines = useRoutinesStore((s) => s.routines);
  const showModal = useModalStore((s) => s.showModal);

  const handleNavigate = () => {
    navigation.navigate("editWorkout", { workoutId: workout.id });
  };

  const handleDelete = () => {
    const routinesUsingWorkout = routines.filter((r) => r.days.some((d) => d.workoutId === workout.id));

    if (routinesUsingWorkout.length > 0) {
      const routineNames = routinesUsingWorkout.map((r) => r.name || "Sin nombre").join(", ");
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
      <TouchableOpacity onPress={handleNavigate} className="p-3 border rounded-md flex-1">
        <Text className="font-bold">{workout.name || `Entreno ${index + 1}`}</Text>
        <Text className="text-neutral-500 text-xs">{workout.steps.length} ejercicios/series</Text>
        <Text className="text-neutral-400 text-[10px] mt-1" numberOfLines={1}>
          {routines.filter((r) => r.days.some((d) => d.workoutId === workout.id)).length > 0
            ? `En uso en: ${routines
                .filter((r) => r.days.some((d) => d.workoutId === workout.id))
                .map((r) => r.name || "Sin nombre")
                .join(", ")}`
            : "No se está usando en ninguna rutina"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} className="p-3 border border-red-200 rounded-md">
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
};
