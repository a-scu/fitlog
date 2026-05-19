export function clamp(value: number, lowerBound: number, upperBound: number) {
  "worklet";
  return Math.max(lowerBound, Math.min(value, upperBound));
}

export function objectMove(
  object: Record<string, number>,
  fromPosition: number,
  toPosition: number,
) {
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

export function listToObject(list: any[], key: string = "id") {
  const object: Record<string, number> = {};
  list.forEach((item: any, index) => {
    object[item[key]] = index;
  });
  return object;
}

export const FAST_SPRING = {
  stiffness: 2000,
  damping: 100,
  mass: 1,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};
