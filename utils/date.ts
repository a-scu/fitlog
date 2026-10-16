import { getDay, getISOWeek, getISOWeekYear, startOfDay } from "date-fns";

export const today = startOfDay(new Date()).toISOString();

export function getWeekId(date: Date) {
  return `${getISOWeekYear(date)}-W${getISOWeek(date).toString().padStart(2, "0")}`;
}

export function getDayOfWeek(date: Date) {
  return getDay(date);
}

export function getAdjustedDayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function getLocalizedDayName(dayIndex: number, t: (key: string) => string) {
  const key = DAY_KEYS[dayIndex];
  return key ? t(`days.${key}`) : "";
}

export function getLocalizedDayShort(dayIndex: number, t: (key: string) => string) {
  const key = DAY_KEYS[dayIndex];
  return key ? t(`days.${key}_short`) : "";
}
