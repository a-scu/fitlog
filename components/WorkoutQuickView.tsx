import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Step, Workout } from "@/types/Workout";

import { dayNames } from "@/constants/DayNames";

import { getRoutineMuscles } from "@/utils/routineMuscles";
import { adjustedDay, monthDay } from "@/constants/Time";
import { Routine } from "@/types/Routine";
import { Image } from "expo-image";
import { getSortedMusclesWithImages } from "@/utils/muscleUtils";

interface Props {
  workout: Workout;
  routine: Routine;
  canEdit?: boolean;
  canStart?: boolean;
}

import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { isSameDay, startOfDay } from "date-fns";

import { Alert } from "react-native";

export default function WorkoutQuickView({ workout, routine, canEdit = true, canStart = true }: Props) {
  const navigation = useNavigation();
  const { activeWorkoutId, startWorkout } = useActiveWorkoutStore((s) => s);

  const today = startOfDay(new Date()).toISOString();

  const workoutSessions = useWorkoutsHistoryStore((s) => s.workoutSessions);
  const workoutSession = workoutSessions.find((ws) => isSameDay(ws.date, today));

  console.log("workoutSession", workoutSession);

  const sets = workout.steps.filter((s: Step) => s.type !== "rest");

  console.log("Sets", sets);

  const { target, secondary } = getRoutineMuscles(sets);

  const handleStartWorkout = () => {
    if (workoutSession?.status === "completed") {
      Alert.alert(
        "Reiniciar Entreno",
        "Si reinicias el entreno de hoy, todos tus registros se resetearán. ¿Estás seguro?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reiniciar",
            style: "destructive",
            onPress: () => {
              useWorkoutsHistoryStore.getState().updateWorkoutSessionField(today, "status", "in_progress");
              useWorkoutsHistoryStore.getState().updateWorkoutSessionField(today, "sets", []);
              startWorkout(workout.id, routine.id);
              navigation.navigate("workoutSession", {
                date: new Date().toISOString(),
              });
            },
          },
        ]
      );
    } else {
      startWorkout(workout.id, routine.id);
      navigation.navigate("workoutSession", {
        date: new Date().toISOString(),
      });
    }
  };

  const handleFreeWorkout = () => {
    if (workoutSession?.status === "completed") {
      Alert.alert(
        "Reiniciar Entreno",
        "Si reinicias el entreno de hoy, todos tus registros se resetearán. ¿Estás seguro?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reiniciar",
            style: "destructive",
            onPress: () => {
              useWorkoutsHistoryStore.getState().updateWorkoutSessionField(today, "status", "in_progress");
              useWorkoutsHistoryStore.getState().updateWorkoutSessionField(today, "sets", []);
              startWorkout("free", routine.id);
              navigation.navigate("workoutSession", {
                date: new Date().toISOString(),
              });
            },
          },
        ]
      );
    } else {
      startWorkout("free", routine.id);
      navigation.navigate("workoutSession", {
        date: new Date().toISOString(),
      });
    }
  };

  const showFreeWorkoutButton = !workoutSession || workoutSession.status === "completed";

  const isCurrentActive = activeWorkoutId === workout.id;
  const isAnotherActive = activeWorkoutId !== null && activeWorkoutId !== workout.id;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("workout", { workoutId: workout.id })}
      className="p-5 rounded-xl border border-neutral-200"
    >
      <View className="items-start justify-between flex-row">
        <Text className="text-neutral-500 text-sm">Entreno de hoy</Text>
        <View className="justify-end items-center flex-row gap-1">
          <Text className="text-neutral-400 text-end text-sm">Ver entreno</Text>
          <Ionicons name="enter-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
        </View>
      </View>

      <View className="flex-1 flex-row gap-2.5">
        <View className="flex-1">
          <Text className="font-bold text-xl">{workout?.name}</Text>

          <View className="flex-row flex-wrap gap-2 my-3 items-center">
            {getSortedMusclesWithImages(target).map((muscleData) => {
              if (muscleData.image) {
                return (
                  <View key={muscleData.name} className="size-8">
                    <Image source={muscleData.image} style={{ width: "100%", height: "100%" }} contentFit="contain" />
                  </View>
                );
              }

              return (
                <Text key={muscleData.name} className="text-neutral-500 text-sm">
                  {muscleData.name}
                </Text>
              );
            })}
          </View>

          <View className="flex-1 flex-row gap-1">
            {showFreeWorkoutButton && (
              <TouchableOpacity
                onPress={handleFreeWorkout}
                className="border flex-row p-3 flex-1 border-neutral-200 rounded-lg justify-center gap-1.5"
              >
                <Text className="text-neutral-500 text-end text-sm">Realizar entreno libre</Text>
                <Ionicons name="fitness-outline" className="!text-sm !leading-none" color={colors.neutral[500]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isCurrentActive ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("workoutSession", { date: today })}
            className="mt-4 p-4 bg-blue-50 border-blue-200 border-2 rounded-xl items-center justify-center"
          >
            <Text className="text-blue-600 font-bold text-xs">REANUDAR</Text>
          </TouchableOpacity>
        ) : isAnotherActive ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("workoutSession", { date: today })}
            className="mt-4 p-4 bg-neutral-50 border-neutral-200 border-2 rounded-xl items-center justify-center"
          >
            <Text className="text-neutral-400 font-bold text-xs text-center">OTRO EN CURSO</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleStartWorkout}
            className="mt-4 p-3 pl-4 aspect-square bg-green-50 border-green-200 border-2 rounded-xl items-center justify-center"
          >
            <Ionicons
              name={workoutSession?.status === "completed" ? "reload-outline" : "play-outline"}
              size={24}
              color={colors.green[500]}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
