import { useNavigation } from "@react-navigation/native";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import colors from "tailwindcss/colors";

import { Routine } from "@/types/Routine";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { getMuscleImage, getWorkoutMuscles } from "@/utils/muscles";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getComparisonDays } from "@/utils/comparisonDays";
import { getDayOfWeek, getWeekId, getLocalizedDayShort } from "@/utils/date";
import { useTranslation } from "react-i18next";

interface WeekOverviewProps {
  date: Date;
  routine: Routine;
}

export default function WeekOverview({ date, routine }: WeekOverviewProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const workouts = useWorkoutsStore((state) => state.workouts);

  const weekId = getWeekId(date);
  const overrideWeek = routine.weekOverrides?.[weekId];

  const comparisonDays = getComparisonDays(routine.days, overrideWeek?.days);
  const hasAnyChange = comparisonDays.some((d) => d.hasChanged);

  return (
    <View className="bg-white dark:bg-neutral-950">
      <TouchableOpacity
        onPress={() => navigation.navigate("activeWeek")}
        className="flex-row gap-1.5 px-2"
      >
        {comparisonDays.map((d, index) => {
          const workout = workouts.find((w) => w.id === d.workoutId);

          const workoutSets = workout?.steps.filter((s) => s.type !== "rest");

          const { target, secondary } = getWorkoutMuscles(workoutSets || []);

          const isActiveDay =
            (getDayOfWeek(date) === 0 && index === 6) ||
            getDayOfWeek(date) === index + 1;

          return (
            <View
              key={index}
              className="items-center flex-1 border py-3 rounded-lg"
              style={{
                borderColor: isActiveDay
                  ? d.isRestDay
                    ? colors.indigo[700]
                    : colors.green[700]
                  : colors.neutral[700],
                backgroundColor: isActiveDay
                  ? d.isRestDay
                    ? colors.indigo[950] + "80"
                    : colors.green[950] + "80"
                  : colors.transparent,
              }}
            >
              {/* <View
                className="size-1 rounded-full mb-1"
                style={{
                  backgroundColor: d.isRestDay
                    ? colors.neutral[600]
                    : colors.green[500],
                }}
              /> */}

              <Text
                style={{
                  color: isActiveDay
                    ? d.isRestDay
                      ? colors.indigo[500]
                      : colors.green[500]
                    : d.isRestDay
                      ? colors.neutral[600]
                      : colors.green[500],
                }}
                className={
                  d.hasChanged ? "font-bold text-sm" : "font-medium text-sm"
                }
              >
                {getLocalizedDayShort(index, t)}
              </Text>

              {d.isRestDay ? (
                <Ionicons
                  name="bed-outline"
                  size={18}
                  className="mt-0.5"
                  color={isActiveDay ? colors.indigo[500] : colors.neutral[600]}
                />
              ) : workout && target ? (
                <Image
                  source={getMuscleImage(target[0])}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 12,
                    marginTop: 2,
                  }}
                />
              ) : (
                <Ionicons
                  name={"fitness-outline"}
                  color={colors.green[500]}
                  size={18}
                  className="mt-0.5"
                />
              )}
            </View>
          );
        })}
      </TouchableOpacity>
    </View>
  );
}
