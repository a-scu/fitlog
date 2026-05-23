import { getDay, getISOWeek, getISOWeekYear } from "date-fns";

export function getWeekId(date: Date) {
  return `${getISOWeekYear(date)}-W${getISOWeek(date).toString().padStart(2, "0")}`;
}

export function getDayOfWeek(date: Date) {
  return getDay(date);
}

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function getLocalizedDayName(dayIndex: number, t: (key: string) => string) {
  const key = DAY_KEYS[dayIndex];
  return key ? t(`days.${key}`) : "";
}

export function getLocalizedDayShort(dayIndex: number, t: (key: string) => string) {
  const key = DAY_KEYS[dayIndex];
  return key ? t(`days.${key}_short`) : "";
}
