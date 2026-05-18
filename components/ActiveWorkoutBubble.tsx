import { View, Text, TouchableOpacity } from "react-native";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";

export default function ActiveWorkoutBubble() {
  const {
    activeWorkoutId,
    isPaused,
    currentRoute,
    finishWorkout,
    pauseWorkout,
    resumeWorkout,
    freeWorkout,
  } = useActiveWorkoutStore();
  const workouts = useWorkoutsStore((s) => s.workouts);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  if (!activeWorkoutId) return null;

  const workoutName = freeWorkout
    ? "Entreno Libre"
    : workouts.find((w) => w.id === activeWorkoutId)?.name || "Entrenamiento";

  const handleMaximize = () => {
    navigation.navigate("workoutSession", { date: new Date().toISOString() });
  };

  const handleFinish = () => {
    // This should ideally prompt the user or handle the completion logic
    useWorkoutsHistoryStore
      .getState()
      .updateWorkoutSessionField(
        new Date().toISOString(),
        "status",
        "completed",
      );
    finishWorkout();
  };

  const togglePause = () => {
    if (isPaused) resumeWorkout();
    else pauseWorkout();
  };

  return (
    <View className="w-full bg-white flex-row dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-4 pr-0">
      <TouchableOpacity
        onPress={handleMaximize}
        className="flex-row items-center justify-between flex-1"
      >
        <View className="flex-row items-center gap-3">
          <View className="bg-black dark:bg-white p-1 rounded-full">
            <Ionicons
              name="barbell"
              size={20}
              className="!text-white dark:!text-black"
            />
          </View>
          <View>
            <Text className="font-bold text-base text-neutral-900 dark:text-white">
              {workoutName}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {isPaused ? "Pausado" : "En progreso..."}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View className="flex-row justify-around">
        <TouchableOpacity onPress={handleFinish} className="items-center px-3">
          <Ionicons name="stop" size={22} className="!text-red-500" />
          <Text className="text-xs text-red-500 mt-1">Finalizar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePause} className="items-center px-3">
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={22}
            className="!text-black dark:!text-white"
          />
          <Text className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            {isPaused ? "Reanudar" : "Pausar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center px-3 opacity-50">
          <Ionicons
            name="play-skip-forward"
            size={22}
            className="!text-black dark:!text-white"
          />
          <Text className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Saltar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
