import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import WorkoutOverview from "@/components/WorkoutOverview";
import { useNavigation } from "@react-navigation/native";

import { SCREEN_WIDTH } from "@/constants/Layout";

import WeekOverview from "@/components/WeekOverview";
import { getWeekId } from "@/screens/Weeks/WeeksScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { capitalize } from "@/utils/text";
import { Routine } from "@/types/Routine";
import Colors from "@/constants/Colors";
import colors from "tailwindcss/colors";
import { getAdjustedDayIndex } from "@/utils/date";

const today = new Date();

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);
  const routines = useRoutinesStore((s) => s.routines);

  const routine = routines.find((r) => r.id === personalWorkspace.routineId);

  console.log("Active routine id:", personalWorkspace.routineId);

  console.log("Routines", routines);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center">
        <View className="flex-1 pl-4">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">fitlog</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-medium text-center text-neutral-300">{capitalize(format(today, "EEEE d 'de' MMMM", { locale: es }))}</Text>
        </View>

        <View className="flex-1 items-end">
          <TouchableOpacity className="p-4" onPress={() => navigation.navigate("workspaceSettings")}>
            <Ionicons name="settings-outline" className="!text-neutral-800 dark:!text-white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {routine && (
        <>
          <TouchableOpacity
            className="p-2 flex-row items-end justify-center"
            onPress={() => navigation.navigate("routine", { routineId: routine?.id })}
          >
            <Text className="text-neutral-300 text-sm mr-auto">{routine.name}</Text>

            <Text className="text-neutral-500 text-xs">Ver rutina</Text>
            <Ionicons name="chevron-forward-outline" size={10} color={colors.neutral[500]} />
          </TouchableOpacity>

          <WeekOverview date={today} routine={routine} />
        </>
      )}

      <DayContent date={today} routine={routine} />
    </View>
  );
}

const DayContent = memo(({ date, routine }: { date: Date; routine: Routine | undefined }) => {
  const navigation = useNavigation<any>();

  const workouts = useWorkoutsStore((s) => s.workouts);
  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date.toISOString()));

  const adjustedDayIndex = getAdjustedDayIndex(date);
  const weekId = getWeekId(date);
  const currentDays = routine?.weekOverrides?.[weekId]?.days || routine?.days;

  console.log("active routine:", routine);

  const plannedDay = currentDays?.[adjustedDayIndex];
  const plannedWorkout = workouts.find((w) => w.id === plannedDay?.workoutId);

  console.log("plannedWorkout:", plannedWorkout);

  const validWorkoutSession = workoutSession && workoutSession.isCompleted;

  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-2 gap-4 grow">
        {routine ? (
          plannedDay?.isRestDay ? (
            <View className="border border-neutral-700 rounded-md p-4 gap-4">
              <Text className="text-neutral-900 dark:text-white text-center">Dia de descanso</Text>

              <View className="flex-1 flex-row items-center justify-center gap-4">
                <View className="size-12 bg-white rounded-full" />
                <Text className="text-white">Estadisticas</Text>
              </View>
            </View>
          ) : (
            <WorkoutOverview date={date} routineId={routine.id} workout={plannedWorkout} isRestDay={plannedDay?.isRestDay} />
          )
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("createRoutine", {
                  workspaceId: personalWorkspace.id,
                });
              }}
            >
              <Text className="text-white">Crear Rutina</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
});
