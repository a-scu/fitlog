import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Image } from "expo-image";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";

import { Step, Workout } from "@/types/Workout";

import { getWorkoutMuscles, getSortedMusclesWithImages } from "@/utils/muscles";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import RestOverview from "./RestOverview";
import { isSameDay } from "date-fns";

interface Props {
  date: Date;
  workout: Workout | undefined;
  isRestDay?: boolean;
}

export default function WorkoutOverview({ date, workout, isRestDay }: Props) {
  const activeWorkoutId = useActiveWorkoutStore((s) => s.activeWorkoutId);

  // console.log(date, workout, isRestDay);

  if (isRestDay) return <RestOverview date={date} />;

  if (activeWorkoutId) return <ActiveView date={date} />;

  if (!workout && !isRestDay)
    return <EmptyView date={date} isRestDay={isRestDay} />;

  if (!workout) return <EmptyView date={date} isRestDay={isRestDay} />;

  return <RegularView date={date} workout={workout} isRestDay={isRestDay} />;
}

const RegularView = ({
  date,
  workout,
  isRestDay,
}: {
  date: Date;
  workout: Workout;
  isRestDay: boolean | undefined;
}) => {
  const navigation = useNavigation<any>();

  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const workoutSession = useWorkoutsHistoryStore((s) =>
    s.getWorkoutSession(date),
  );

  const sets = workout.steps.filter((s: Step) => s.type !== "rest");
  const { target, secondary } = getWorkoutMuscles(sets);

  const handleStartFreeWorkout = () => {
    startWorkout("free");
    navigation.navigate("workoutSession", {
      date: new Date(),
    });
  };

  const handleStartWorkout = () => {
    startWorkout(workout.id);
    navigation.navigate("workoutSession", {
      date: new Date(),
    });
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
          <Ionicons
            name="enter-outline"
            className="!text-sm !leading-none"
            color={colors.neutral[400]}
          />
        </View>
      </View>

      <View className="flex-1 flex-row gap-2.5">
        <View className="flex-1">
          <Text className="font-bold text-xl text-neutral-900 dark:text-white">
            {workout?.name}
          </Text>

          <View className="flex-row flex-wrap gap-2 my-3 items-center">
            {getSortedMusclesWithImages(target).map((muscleData) => {
              if (muscleData.image) {
                return (
                  <View key={muscleData.name} className="size-8">
                    <Image
                      source={muscleData.image}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="contain"
                    />
                  </View>
                );
              }

              return (
                <Text
                  key={muscleData.name}
                  className="text-neutral-500 text-sm"
                >
                  {muscleData.name}
                </Text>
              );
            })}
          </View>

          {workoutSession?.status !== "completed" && (
            <View className="flex-1 flex-row gap-1">
              {!isRestDay && (
                <TouchableOpacity
                  onPress={handleStartFreeWorkout}
                  className="border flex-row p-3 flex-1 border-neutral-200 dark:border-neutral-700 rounded-lg justify-center gap-1.5"
                >
                  <Text className="text-neutral-500 text-end text-sm">
                    Realizar entreno libre
                  </Text>
                  <Ionicons
                    name="fitness-outline"
                    className="!text-sm !leading-none"
                    color={colors.neutral[500]}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {workoutSession?.status !== "completed" && (
          <TouchableOpacity
            onPress={handleStartWorkout}
            className="mt-4 p-3 pl-4 aspect-square bg-green-50 dark:bg-emerald-900/30 border-green-200 dark:border-emerald-800 border-2 rounded-xl items-center justify-center"
          >
            <Ionicons
              name={"play-outline"}
              size={24}
              className="!text-green-500 dark:!text-emerald-400"
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyView = ({
  date,
  isRestDay,
}: {
  date: Date;
  isRestDay: boolean | undefined;
}) => {
  const navigation = useNavigation<any>();

  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);

  const isToday = isSameDay(date, new Date());

  const handleStartFreeWorkout = () => {
    startWorkout("free");
    navigation.navigate("workoutSession", {
      date: new Date(),
    });
  };

  const handleEditRoutine = () => {
    navigation.navigate("routine", { routineId: personalWorkspace.routineId });
  };

  return (
    <View className="gap-3">
      <View className="border-1.5 dark:bg-green-950/50 dark:border-green-900 p-5 rounded-2xl">
        {/* <View className="top-5 right-5 absolute">
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.green[500]}
                />
              </View> */}

        <View className="flex-row items-center gap-1">
          <Ionicons
            name="fitness-outline"
            size={16}
            color={colors.green[500]}
          />
          <Text className="text-green-500 dark:text-green-500 text-lg font-medium">
            Entreno
          </Text>
        </View>

        <View className="size-44 self-center">
          <Image
            source={require("@/assets/images/etc/training-bear.png")}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="contain"
          />
        </View>

        <View className="flex-row gap-2.5">
          <TouchableOpacity
            onPress={handleEditRoutine}
            className="flex-row items-center flex-1 border rounded-xl border-green-200 dark:border-green-500 py-3 px-6 gap-1 justify-center"
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={colors.green[500]}
            />
            <Text className="text-green-500">Editar rutina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStartFreeWorkout}
            className="flex-row items-center flex-1 border rounded-xl border-green-200 dark:border-green-500 py-3 px-6 gap-1 justify-center"
          >
            <Ionicons
              name="barbell-outline"
              size={14}
              color={colors.green[500]}
            />
            <Text className="text-green-500">Realizar entreno libre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ActiveView = ({ date }: { date: Date }) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("workoutSession", { date: date })}
      className="p-5 rounded-xl flex-row justify-between items-center border-1.5 bg-blue-950/25 border-neutral-200 dark:border-blue-800"
    >
      <View className="flex-row items-center gap-1">
        <Ionicons name="fitness-outline" size={20} color={colors.blue[500]} />
        <Text className="text-blue-500 font-medium">Entreno en curso</Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Ionicons name="play-outline" size={20} color={colors.blue[500]} />
        <Text className="text-blue-600 dark:text-blue-500 font-medium">
          Reanudar entreno
        </Text>
      </View>
    </TouchableOpacity>
  );
};
