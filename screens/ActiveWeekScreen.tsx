import { SCREEN_WIDTH } from "@/constants/layout";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { Ionicons } from "@expo/vector-icons";
import { startOfDay } from "date-fns";
import { memo, useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import colors from "tailwindcss/colors";

import { RoutineDay } from "@/types/Routine";
import { ReorderableList } from "@/components/ReorderableList";
import { getWeekId } from "./Weeks/WeeksScreen";
import { getLocalizedDayShort } from "@/utils/date";
import { useTranslation } from "react-i18next";

/** Height of each day-row (label column + card area). */
const ROW_HEIGHT = 68;
/** Vertical gap between rows. */
const ROW_GAP = 8;
/** Full step = height + gap */
const ROW_STEP = ROW_HEIGHT + ROW_GAP;

const NUM_DAYS = 7;

export default function ActiveWeekScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const date = startOfDay(new Date());

  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);

  const routines = useRoutinesStore((state) => state.routines);
  const updateWeekOverride = useRoutinesStore((s) => s.updateWeekOverride);
  const discardWeekOverride = useRoutinesStore((s) => s.discardWeekOverride);

  const routine = routines.find((r) => r.id === personalWorkspace.routineId);

  const weekId = getWeekId(date);

  const workouts = useWorkoutsStore((s) => s.workouts);

  if (!routine) {
    return (
      <View
        style={{ width: SCREEN_WIDTH, flex: 1 }}
        className="items-center justify-center"
      >
        <Text className="text-neutral-400 dark:text-neutral-500">
          Sin rutina asignada
        </Text>
      </View>
    );
  }

  // Resolve source: override → base days. Filter corrupt entries.
  const resolve = (src: any[]) =>
    (src ?? []).filter(
      (d: any) => d && typeof d === "object" && typeof d.dayIndex === "number",
    );

  let sourceDays: RoutineDay[] = resolve(
    routine.weekOverrides?.[weekId]?.days ?? routine.days,
  );
  if (sourceDays.length < NUM_DAYS) {
    sourceDays = resolve(routine.days);
  }
  // Ensure exactly NUM_DAYS slots, sorted by slot position
  // (The stored array index IS the slot; dayIndex is only identity)
  const [assignments, setAssignments] = useState<RoutineDay[]>(sourceDays);

  // Sync when week/routine/overrides change
  useEffect(() => {
    const fresh = resolve(
      routine.weekOverrides?.[weekId]?.days ?? routine.days,
    );
    setAssignments(fresh.length >= NUM_DAYS ? fresh : resolve(routine.days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId, routine.days, routine.weekOverrides]);

  const hasOverride = !!routine.weekOverrides?.[weekId];

  const handleReorder = useCallback(
    (reordered: RoutineDay[]) => {
      setAssignments(reordered);
      const isIdentical =
        reordered.length === routine.days.length &&
        reordered.every((day, idx) => {
          const originalDay = routine.days[idx];
          return (
            day.dayIndex === originalDay.dayIndex &&
            day.workoutId === originalDay.workoutId &&
            day.isRestDay === originalDay.isRestDay
          );
        });

      if (isIdentical) {
        discardWeekOverride(routine.id, weekId);
      } else {
        updateWeekOverride(routine.id, weekId, reordered);
      }
    },
    [routine.id, weekId, routine.days, updateWeekOverride, discardWeekOverride],
  );

  const renderLeftColumn = useCallback(
    () => (
      <View
        style={{
          width: 36,
          marginRight: 8,
          height: NUM_DAYS * ROW_STEP - ROW_GAP,
          position: "relative",
        }}
      >
        {Array.from({ length: NUM_DAYS }).map((_, index) => (
          <View
            key={index}
            style={{
              position: "absolute",
              top: index * ROW_STEP,
              left: 0,
              width: 36,
              height: ROW_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-neutral-400 dark:text-neutral-500 font-bold text-sm">
              {getLocalizedDayShort(index, t)}
            </Text>
          </View>
        ))}
      </View>
    ),
    [t],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white dark:bg-neutral-900">
        <View style={{ flex: 1, padding: 16 }}>
          {hasOverride && (
            <View className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 rounded-xl mb-4">
              <Text className="text-amber-800 dark:text-amber-400 font-medium text-center text-sm">
                Orden alternativo activo esta semana
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => discardWeekOverride(routine.id, weekId)}
            className="p-3 mb-4 border rounded-xl border-neutral-300"
          >
            <Text className="text-neutral-800 dark:text-neutral-400 font-medium text-center text-sm">
              Descartar cambios
            </Text>
          </TouchableOpacity>

          <Text className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
            Mantén presionado la asignación para moverla a otro día
          </Text>

          <View style={{ flex: 1 }}>
            <ReorderableList<RoutineDay>
              items={assignments}
              keyExtractor={(day) => String(day.dayIndex)}
              itemHeight={ROW_HEIGHT}
              gap={ROW_GAP}
              contentPadding={0}
              skipGestureRoot
              onReorder={handleReorder}
              renderLeftColumn={renderLeftColumn}
              renderItem={({ item: day, index }) => {
                const workout = workouts.find((w) => w.id === day.workoutId);

                console.log(index, day);

                return (
                  <View className="flex-1 flex-row items-center px-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    {day.isRestDay ? (
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 items-center justify-center">
                          <Ionicons
                            name="moon-outline"
                            size={14}
                            color={colors.neutral[400]}
                          />
                        </View>
                        <Text className="text-neutral-400 dark:text-neutral-500 font-semibold text-base">
                          {workout?.name || "Descanso"}
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                          <Ionicons
                            name="barbell-outline"
                            size={14}
                            color={colors.green[500]}
                          />
                        </View>
                        <Text
                          className="flex-1 font-bold text-base text-neutral-900 dark:text-white"
                          numberOfLines={1}
                        >
                          {workout?.name ?? "Entrenamiento"}
                        </Text>
                      </View>
                    )}

                    {/* Drag handle */}
                    <Ionicons
                      name="menu-outline"
                      size={20}
                      color={colors.neutral[300]}
                    />
                  </View>
                );
              }}
            />
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
