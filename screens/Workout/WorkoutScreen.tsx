import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useModalStore } from "@/stores/useModalStore";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import WorkoutSteps from "./components/WorkoutSteps";

export default function WorkoutScreen({ navigation, route }: any) {
  const { workoutId } = route.params;

  const insets = useSafeAreaInsets();

  const workouts = useWorkoutsStore((state) => state.workouts);
  const deleteWorkout = useWorkoutsStore((state) => state.deleteWorkout);
  const routines = useRoutinesStore((s) => s.routines);
  const showModal = useModalStore((s) => s.showModal);

  const workout = workouts.find((r) => r.id === workoutId);

  useEffect(() => {
    navigation.setOptions({ title: workout?.name });
  }, [workout?.name, navigation]);

  const handleDeleteWorkout = () => {
    const routinesUsingWorkout = routines.filter((r) => r.days.some((d) => d.workoutId === workoutId));

    if (routinesUsingWorkout.length > 0) {
      const routineNames = routinesUsingWorkout.map((r) => r.name || "Sin nombre").join(", ");
      showModal({
        snapPoints: ["45%"],
        content: (
          <ConfirmationModal
            title="¿Eliminar entreno en uso?"
            description={`Este entreno se está usando en las siguientes rutinas: ${routineNames}. Si lo eliminas, desaparecerá de esas rutinas.`}
            onConfirm={() => {
              deleteWorkout(workoutId);
              navigation.goBack();
            }}
            confirmText="Eliminar"
            type="danger"
          />
        ),
      });
    } else {
      deleteWorkout(workoutId);
      navigation.goBack();
    }
  };

  if (!workout) return null;

  return (
    <View className="flex-1 flex-grow bg-white" style={{ paddingBottom: insets.bottom }}>
      <Text>{workout.type}</Text>

      <ScrollView className="flex-1 p-3">
        <WorkoutSteps workout={workout} />
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row items-center gap-2 px-3 mb-3">
        <TouchableOpacity
          onPress={() => navigation.navigate("editWorkout", { workoutId })}
          className="flex-1 p-3 bg-neutral-800 rounded-lg"
        >
          <Text className="text-center text-white font-medium">Editar rutina</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-2 px-3 mb-3">
        <TouchableOpacity onPress={handleDeleteWorkout} className="flex-1 p-3 border-red-400 border rounded-lg">
          <Text className="text-center text-red-500 font-medium">Eliminar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 p-3 bg-red-400 rounded-lg">
          <Text className="text-center text-white font-bold">Iniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
