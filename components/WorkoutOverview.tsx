import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Image } from "expo-image";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";

import { Step, Workout } from "@/types/Workout";

import { getWorkoutMuscles, getSortedMusclesWithImages } from "@/utils/muscles";

import RestOverview from "./RestOverview";

interface Props {
  date: Date;
  routineId: string;
  workout: Workout | undefined;
  isRestDay?: boolean;
}

export default function WorkoutOverview({ date, routineId, workout, isRestDay }: Props) {
  const activeWorkoutId = useActiveWorkoutStore((s) => s.activeWorkoutId);
  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date));
  const navigation = useNavigation();

  // console.log(date, workout, isRestDay);

  if (workoutSession?.isCompleted)
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("workoutSession", { date: date });
          }}
        >
          <Text className="text-white">Entreno completado</Text>
          <Text className="text-neutral-500">Ver sesion de entreno</Text>
        </TouchableOpacity>
      </View>
    );

  if (isRestDay) return <RestOverview date={date} />;

  if (activeWorkoutId) return <ActiveView date={date} />;

  if (!workout) return <EmptyView date={date} routineId={routineId} />;

  return <RegularView date={date} workout={workout} isRestDay={isRestDay} />;
}

const RegularView = ({ date, workout, isRestDay }: { date: Date; workout: Workout; isRestDay: boolean | undefined }) => {
  const navigation = useNavigation<any>();

  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date));

  const sets = workout.steps.filter((s: Step) => s.type !== "rest");
  const { target, secondary } = getWorkoutMuscles(sets);

  const handleStartFreeWorkout = () => {
    startWorkout("free");
    navigation.navigate("activeWorkout");
  };

  const handleStartWorkout = () => {
    startWorkout(workout.id);
    navigation.navigate("activeWorkout");
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("workout", { workoutId: workout.id })}
      className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800"
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
          <Text className="font-bold text-xl text-neutral-900 dark:text-white">{workout?.name}</Text>

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
        </View>

        {!workoutSession?.isCompleted && (
          <View className="mt-2 gap-2 items-end">
            <TouchableOpacity
              onPress={handleStartWorkout}
              className="size-16 aspect-square bg-green-50 dark:bg-emerald-900/30 border-green-200 dark:border-emerald-800 border-2 rounded-xl items-center justify-center"
            >
              <Ionicons name={"play-outline"} size={24} className="!text-green-500 dark:!text-emerald-400" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartFreeWorkout}
              className="border flex-row p-3 flex-1 border-neutral-200 dark:border-neutral-700 rounded-lg justify-center gap-1.5"
            >
              <Text className="text-neutral-500 text-end text-sm">Realizar entreno libre</Text>
              <Ionicons name="fitness-outline" className="!text-sm !leading-none" color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyView = ({ date, routineId }: { date: Date; routineId: string }) => {
  const navigation = useNavigation();

  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const handleStartFreeWorkout = () => {
    startWorkout("free");
    navigation.navigate("activeWorkout");
  };

  const handleEditRoutine = () => {
    navigation.navigate("routine", {
      routineId,
    });
  };

  const handleRegisterWorkout = () => {
    navigation.navigate("workoutSession", {
      date,
    });
  };

  return (
    <TouchableOpacity onPress={handleEditRoutine} className="bg-green-950/50 p-4 rounded-md">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-1">
          <Text className="text-green-500 dark:text-green-500 text-lg font-medium">Entreno</Text>
          <Ionicons name="fitness-outline" size={16} color={colors.green[500]} />
        </View>

        <View className="p-2 flex-row items-end justify-center">
          <Text className="text-neutral-500 text-xs">Ver entreno</Text>
          <Ionicons name="chevron-forward-outline" size={10} color={colors.neutral[500]} />
        </View>
      </View>

      <Text className="text-white mb-2">No tenes asignado ningun entreno para este dia</Text>

      <View className="flex-row gap-2.5">
        <TouchableOpacity
          onPress={handleEditRoutine}
          className="flex-row items-center flex-1 border rounded-xl border-green-200 dark:border-green-900 py-3 px-6 gap-1 justify-center"
        >
          <Text className="text-green-500 text-sm">Editar rutina</Text>
          <Ionicons name="create-outline" size={12} color={colors.green[500]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStartFreeWorkout}
          className="flex-row items-center flex-1 border rounded-xl border-green-200 dark:border-green-900 py-3 px-6 gap-1 justify-center"
        >
          <Text className="text-green-500 text-sm">Realizar entreno libre</Text>
          <Ionicons name="barbell-outline" size={12} color={colors.green[500]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRegisterWorkout}
          className="flex-row items-center flex-1 border rounded-xl border-green-200 dark:border-green-900 py-3 px-6 gap-1 justify-center"
        >
          <Text className="text-green-500 text-sm">Registrar Entreno</Text>
          <Ionicons name="checkmark-outline" size={12} color={colors.green[500]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ActiveView = ({ date }: { date: Date }) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("activeWorkout")}
      className="p-5 rounded-xl flex-row justify-between items-center border-1.5 bg-blue-950/25 border-neutral-200 dark:border-blue-800"
    >
      <View className="flex-row items-center gap-1">
        <Ionicons name="fitness-outline" size={20} color={colors.blue[500]} />
        <Text className="text-blue-500 font-medium">Entreno en curso</Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Ionicons name="play-outline" size={20} color={colors.blue[500]} />
        <Text className="text-blue-600 dark:text-blue-500 font-medium">Reanudar entreno</Text>
      </View>
    </TouchableOpacity>
  );
};
