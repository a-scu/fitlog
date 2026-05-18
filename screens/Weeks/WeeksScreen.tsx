/**
 * WeeksScreen
 *
 * Week-by-week swiper. Each page shows 7 fixed day-rows (L→D).
 * The *assignment* (workout / rest) for each day can be dragged to
 * another day slot. The rows themselves never move — only the
 * assignment cards animate between slots.
 *
 * Data model:
 *   assignments[slot]  = RoutineDay whose content is shown in that slot.
 *   slot 0 = Monday, slot 6 = Sunday.
 *
 * positions SharedValue: { [dayIndex]: slotIndex }
 *   Tracks which slot each assignment card currently occupies.
 */

import { SCREEN_WIDTH } from "@/constants/layout";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { Ionicons } from "@expo/vector-icons";
import {
  addWeeks,
  format,
  isSameWeek,
  startOfWeek,
  getISOWeek,
  getISOWeekYear,
} from "date-fns";
import { es } from "date-fns/locale";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import colors from "tailwindcss/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { dayNames } from "@/constants/DayNames";
import { RoutineDay } from "@/types/Routine";
import { ReorderableList } from "@/components/ReorderableList";
import { clamp, objectMove, FAST_SPRING } from "@/lib/dragAndDropUtils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_PAGES = 1;
const INITIAL_PAGE = 0;
const FLATLIST_DATA = Array.from({ length: TOTAL_PAGES }, (_, i) => i);

/** Height of each day-row (label column + card area). */
const ROW_HEIGHT = 68;
/** Vertical gap between rows. */
const ROW_GAP = 8;
/** Full step = height + gap */
const ROW_STEP = ROW_HEIGHT + ROW_GAP;

const NUM_DAYS = 7;

// Day abbreviations, Mon→Sun
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

// ─── Utils ────────────────────────────────────────────────────────────────────

export function getWeekId(date: Date) {
  return `${getISOWeekYear(date)}-W${getISOWeek(date).toString().padStart(2, "0")}`;
}

/**
 * Build a positions map from an ordered assignments array.
 * positions[dayIndex] = slot (0–6).
 * The assignments array index IS the slot.
 */
function buildPositions(assignments: RoutineDay[]): Record<string, number> {
  "worklet";
  const map: Record<string, number> = {};
  assignments.forEach((day, slot) => {
    map[day.dayIndex] = slot;
  });
  return map;
}

/**
 * Reconstruct the ordered assignments array from a positions map + source array.
 * slot[i] = assignments.find(d => positions[d.dayIndex] === i)
 */
function positionsToAssignments(
  source: RoutineDay[],
  pos: Record<string, number>,
): RoutineDay[] {
  const result = new Array<RoutineDay>(source.length);
  for (const day of source) {
    const slot = pos[day.dayIndex];
    if (slot !== undefined) result[slot] = day;
  }
  return result;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WeeksScreen({ navigation, route }: any) {
  const { date } = route.params;

  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);
  const routines = useRoutinesStore((state) => state.routines);

  const [baseDate, setBaseDate] = useState(
    startOfWeek(date || new Date(), { weekStartsOn: 1 }),
  );
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const selectedDate = addWeeks(baseDate, currentPage - INITIAL_PAGE);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const offset = e.contentOffset.x;
      const index = Math.round(offset / SCREEN_WIDTH);
      if (index !== currentPage) {
        scheduleOnRN(setCurrentPage, index);
      }
    },
  });

  const handleDatePicked = (_event: any, pickedDate?: Date) => {
    setShowDatePicker(false);
    if (pickedDate) {
      const selected = startOfWeek(pickedDate, { weekStartsOn: 1 });
      setBaseDate(selected);
      setCurrentPage(INITIAL_PAGE);
      flatListRef.current?.scrollToIndex({
        index: INITIAL_PAGE,
        animated: false,
      });
    }
  };

  const jumpToNext = () => {
    if (currentPage < TOTAL_PAGES - 1)
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
  };
  const jumpToPrev = () => {
    if (currentPage > 0)
      flatListRef.current?.scrollToIndex({
        index: currentPage - 1,
        animated: true,
      });
  };

  const routine = routines.find((r) => r.id === personalWorkspace.routineId);
  const isCurrentWeek = isSameWeek(selectedDate, new Date(), {
    weekStartsOn: 1,
  });

  const getHeaderText = () => {
    if (isCurrentWeek) return "Esta semana";
    return format(selectedDate, "'Semana del' d 'de' MMM", { locale: es });
  };

  const renderItem = useCallback(
    ({ item: index }: { item: number }) => {
      const weekDate = addWeeks(baseDate, index - INITIAL_PAGE);
      return <DayContent date={weekDate} routine={routine} />;
    },
    [baseDate, routine],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white dark:bg-neutral-900">
        {/* Header */}
        <View className="flex-row items-center justify-between h-14 border-b border-neutral-100 dark:border-neutral-800">
          <TouchableOpacity
            onPress={jumpToPrev}
            className="h-14 px-4 justify-center items-center"
            disabled={currentPage === 0}
            style={{ opacity: currentPage === 0 ? 0.3 : 1 }}
          >
            <Ionicons
              name="chevron-back-outline"
              size={18}
              className="!text-neutral-800 dark:!text-white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center gap-2.5 h-14 justify-center"
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.neutral[400]}
            />
            <Text className="text-xl font-medium text-neutral-800 dark:text-white text-center">
              {getHeaderText()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={jumpToNext}
            className="h-14 px-4 justify-center items-center"
          >
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              className="!text-neutral-800 dark:!text-white"
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDatePicked}
          />
        )}

        <Animated.FlatList
          ref={flatListRef}
          horizontal
          decelerationRate="fast"
          initialScrollIndex={INITIAL_PAGE}
          onScroll={scrollHandler}
          data={FLATLIST_DATA}
          keyExtractor={(item) => item.toString()}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          disableIntervalMomentum
          nestedScrollEnabled
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          windowSize={5}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          removeClippedSubviews={false}
          renderItem={renderItem}
        />
      </View>
    </GestureHandlerRootView>
  );
}

// ─── DayContent (one page per week) ───────────────────────────────────────────

const DayContent = memo(({ date, routine }: { date: Date; routine: any }) => {
  const weekId = getWeekId(date);

  const updateWeekOverride = useRoutinesStore((s) => s.updateWeekOverride);
  const discardWeekOverride = useRoutinesStore((s) => s.discardWeekOverride);

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
      updateWeekOverride(routine.id, weekId, reordered);
    },
    [routine.id, weekId, updateWeekOverride],
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
        {DAY_LABELS.map((label, index) => (
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
              {label}
            </Text>
          </View>
        ))}
      </View>
    ),
    [],
  );

  return (
    <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
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
  );
});
