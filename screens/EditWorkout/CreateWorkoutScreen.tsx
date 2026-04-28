import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { randomId } from "@/utils/random";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateWorkoutScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const workouts = useWorkoutsStore((state) => state.workouts);
  const addWorkout = useWorkoutsStore((state) => state.addWorkout);
  const updateRoutineDay = useRoutinesStore((s) => s.updateRoutineDay);

  const [workout, setWorkout] = useState({
    name: "",
  });

  useEffect(() => {
    navigation.setOptions({ title: "Crear entrenamiento" });
  }, []);

  const handleCreateWorkout = () => {
    const { routineId, dayIndex } = route.params || {};
    const newWorkoutId = randomId();
    const newWorkout = {
      id: newWorkoutId,
      name: workout.name || `Entrenamiento ${workouts.length + 1}`,
      steps: [],
    };

    addWorkout(newWorkout);

    if (routineId && dayIndex !== undefined) {
      updateRoutineDay(routineId, dayIndex, "workoutId", newWorkoutId);
      updateRoutineDay(routineId, dayIndex, "isRestDay", false);
    }

    navigation.replace("editWorkout", { workoutId: newWorkoutId });
  };

  return (
    <View className="bg-white flex-1" style={{ paddingBottom: insets.bottom }}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} contentContainerClassName="py-3 gap-6">
        <View className="gap-1 px-3">
          <Text className="text-neutral-500 font-medium mb-1">Nombre del entrenamiento</Text>
          <TextInput
            value={workout.name}
            onChangeText={(value) => setWorkout({ name: value })}
            className="border border-neutral-200 rounded-2xl p-4 text-lg"
            placeholder="Ej: Pecho y Tríceps"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleCreateWorkout}
        className="bg-black items-center justify-center p-8 mx-3 mb-3 rounded-xl"
      >
        <Text className="text-center text-lg font-semibold text-white">Crear entrenamiento</Text>
      </TouchableOpacity>
    </View>
  );
}
