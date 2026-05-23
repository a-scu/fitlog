import { RoutineDay } from "@/types/Routine";

export interface ComparisonDay extends RoutineDay {
  hasChanged: boolean;
}

/**
 * Compares standard routine days with override days and returns a combined list of 7 days,
 * where each day has a boolean `hasChanged` indicating if it has been modified/swapped
 * compared to the base routine day at that slot.
 */
export const getComparisonDays = (
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
