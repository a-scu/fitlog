import { View, Text, TouchableOpacity } from "react-native";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";

export default function ActiveWorkoutBubble() {
  const { activeWorkoutId, isPaused, currentRoute, finishWorkout, pauseWorkout, resumeWorkout } = useActiveWorkoutStore();
  const workouts = useWorkoutsStore((s) => s.workouts);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  if (!activeWorkoutId || currentRoute === "workoutSession") return null;

  const workoutName = activeWorkoutId === "free" ? "Entreno Libre" : workouts.find((w) => w.id === activeWorkoutId)?.name || "Entrenamiento";

  const handleMaximize = () => {
    navigation.navigate("workoutSession", { date: new Date().toISOString() });
  };

  const handleFinish = () => {
    // This should ideally prompt the user or handle the completion logic
    useWorkoutsHistoryStore.getState().updateWorkoutSessionField(new Date().toISOString(), "status", "completed");
    finishWorkout();
  };

  const togglePause = () => {
    if (isPaused) resumeWorkout();
    else pauseWorkout();
  };

  return (
    <View style={{ bottom: insets.bottom + 65, zIndex: 9999, elevation: 10 }} className="absolute self-center left-4 right-4 bg-white border border-neutral-300 shadow-sm rounded-2xl p-4">
      <TouchableOpacity onPress={handleMaximize} className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View className="bg-black p-2 rounded-full">
            <Ionicons name="barbell" size={20} color="white" />
          </View>
          <View>
            <Text className="font-bold text-base">{workoutName}</Text>
            <Text className="text-xs text-neutral-500">{isPaused ? "Pausado" : "En progreso..."}</Text>
          </View>
        </View>
        <Ionicons name="expand" size={20} color="black" />
      </TouchableOpacity>
      
      <View className="flex-row justify-around border-t border-neutral-100 pt-3">
        <TouchableOpacity onPress={togglePause} className="items-center">
          <Ionicons name={isPaused ? "play" : "pause"} size={22} color="black" />
          <Text className="text-xs text-neutral-600 mt-1">{isPaused ? "Reanudar" : "Pausar"}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center opacity-50">
          <Ionicons name="play-skip-forward" size={22} color="black" />
          <Text className="text-xs text-neutral-600 mt-1">Saltar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFinish} className="items-center">
          <Ionicons name="stop" size={22} color="red" />
          <Text className="text-xs text-red-500 mt-1">Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
