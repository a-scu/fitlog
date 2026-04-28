export const adjustedDay = (new Date().getDay() + 6) % 7; // Map 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
export const monthDay = new Date().getDate();
