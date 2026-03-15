
export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  rir: string;
  modifiers: string[];
  dropSets?: DropSet[];
}

export interface DropSet {
  id: string;
  weight: string;
  reps: string;
  rir: string;
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

export const SET_HEIGHT = 56;
export const DROP_SET_HEIGHT = 42;
export const SCROLL_THRESHOLD = SET_HEIGHT;

export const FAST_SPRING = {
  stiffness: 2000,
  damping: 100,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};

