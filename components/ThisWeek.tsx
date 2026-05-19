import { useNavigation } from "@react-navigation/native";
import { getISOWeek, getISOWeekYear, isToday } from "date-fns";
import { View, Text, Pressable } from "react-native";
import colors from "tailwindcss/colors";

import { Routine, RoutineDay } from "@/types/Routine";
import { dayNames } from "@/constants/DayNames";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { getMuscleImage, getWorkoutMuscles } from "@/utils/muscles";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export function getWeekId(date: Date) {
  return `${getISOWeekYear(date)}-W${getISOWeek(date).toString().padStart(2, "0")}`;
}

interface ThisWeekProps {
  date: Date;
  routine: Routine;
}

export interface ComparisonDay extends RoutineDay {
  hasChanged: boolean;
}

/**
 * Compares standard routine days with override days and returns a combined list of 7 days,
 * where each day has a boolean `hasChanged` indicating if it has been modified/swapped
 * compared to the base routine day at that slot.
 */

export const getDays = (
  routineDays: RoutineDay[],
  overrideDays?: RoutineDay[],
): ComparisonDay[] => {
  const resolvedRoutine = (routineDays ?? []).filter(
    (d) => d && typeof d === "object" && typeof d.dayIndex === "number",
  );

  if (!overrideDays || overrideDays.length < 7) {
    return resolvedRoutine.map((d) => ({
      ...d,
      hasChanged: false,
    }));
  }

  const resolvedOverride = overrideDays.filter(
    (d) => d && typeof d === "object" && typeof d.dayIndex === "number",
  );

  return resolvedOverride.map((day, index) => {
    const originalDay = resolvedRoutine[index];
    const hasChanged = originalDay
      ? day.dayIndex !== index ||
        day.workoutId !== originalDay.workoutId ||
        day.isRestDay !== originalDay.isRestDay
      : false;

    return {
      ...day,
      hasChanged,
    };
  });
};

export default function ThisWeek({ date, routine }: ThisWeekProps) {
  const navigation = useNavigation();
  const weekId = getWeekId(date);
  const overrideWeek = routine.weekOverrides?.[weekId];

  // Compare and get the list of days with changes highlighted
  const comparisonDays = getDays(routine.days, overrideWeek?.days);

  const hasAnyChange = comparisonDays.some((d) => d.hasChanged);

  const workouts = useWorkoutsStore((state) => state.workouts);

  return (
    <Pressable
      onPress={() => navigation.navigate("weeks", { date })}
      className="bg-white dark:bg-neutral-900"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-neutral-800 dark:text-white font-semibold">
          Esta semana
        </Text>
        {hasAnyChange && (
          <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <Text className="text-[10px] text-center text-amber-800 dark:text-amber-500 font-bold">
              Modificado
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-1.5">
        {comparisonDays.map((d, index) => {
          let color: string = d.isRestDay
            ? colors.neutral[400]
            : colors.green[400];

          if (d.hasChanged) {
            color = d.isRestDay ? colors.neutral[400] : colors.green[500];
          }

          const workout = workouts.find((w) => w.id === d.workoutId);

          const workoutSets = workout?.steps.filter((s) => s.type !== "rest");

          const { target, secondary } = getWorkoutMuscles(workoutSets || []);

          return (
            <View
              key={dayNames[index]}
              className="items-center flex-1 border py-3 rounded-lg"
              style={{
                borderColor: d.isRestDay
                  ? colors.neutral[700]
                  : colors.neutral[700],
              }}
            >
              <View
                className="w-1 h-1 rounded-full mb-1"
                style={{
                  backgroundColor: d.isRestDay
                    ? colors.neutral[600]
                    : colors.green[500],
                }}
              />

              <Text
                style={{
                  color: d.isRestDay ? colors.neutral[600] : color,
                }}
                className={
                  d.hasChanged ? "font-bold text-sm" : "font-medium text-sm"
                }
              >
                {dayNames[index][0].toUpperCase()}
              </Text>

              {!d.isRestDay && workout && target && (
                <Image
                  source={getMuscleImage(target[0])}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 12,
                    marginTop: 2,
                  }}
                />
              )}

              {d.isRestDay && (
                <Ionicons
                  name="bed-sharp"
                  size={18}
                  className="mt-0.5"
                  color={colors.neutral[600]}
                />
              )}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
