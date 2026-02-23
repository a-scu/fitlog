export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  modifiers: string[];
}

export function clamp(value: number, lowerBound: number, upperBound: number) {
  "worklet";
  return Math.max(lowerBound, Math.min(value, upperBound));
}

export function objectMove(object: Record<string, number>, fromPosition: number, toPosition: number) {
  "worklet";
  const newObject = { ...object };
  for (const id in object) {
    if (object[id] === fromPosition) {
      newObject[id] = toPosition;
    } else if (object[id] === toPosition) {
      newObject[id] = fromPosition;
    }
  }
  return newObject;
}

export function listToObject(list: ExerciseSet[]) {
  const object: Record<string, number> = {};
  list.forEach((item, index) => {
    object[item.id] = index;
  });
  return object;
}

export const SET_HEIGHT = 64;
export const SCROLL_THRESHOLD = SET_HEIGHT;

export const FAST_SPRING = {
  stiffness: 2000,
  damping: 100,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};
