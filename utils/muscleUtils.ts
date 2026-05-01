import { MUSCLES, MUSCLE_IMAGES } from "@/constants/Muscles";

export type MuscleDisplayData = {
  name: string;
  image: any;
  priority: number;
};

// Map muscle values to a canonical key in MUSCLE_IMAGES
const MUSCLE_ALIAS_MAP: Record<string, keyof typeof MUSCLE_IMAGES> = {
  [MUSCLES.chest]: "chest",
  [MUSCLES.pectorals]: "chest",
  [MUSCLES.upperChest]: "chest",
  [MUSCLES.back]: "lats", // Fallback to lats if back image is missing
  [MUSCLES.latissimusDorsi]: "lats",
  [MUSCLES.lats]: "lats",
  [MUSCLES.quadriceps]: "quads",
  [MUSCLES.quads]: "quads",
  [MUSCLES.hamstrings]: "femorals",
  [MUSCLES.femorals]: "femorals",
  [MUSCLES.deltoids]: "shoulders",
  [MUSCLES.shoulders]: "shoulders",
  [MUSCLES.rearDeltoids]: "shoulders",
  [MUSCLES.biceps]: "biceps",
  [MUSCLES.triceps]: "triceps",
  [MUSCLES.abs]: "abs",
  [MUSCLES.abdominals]: "abs",
  [MUSCLES.lowerAbs]: "lowerAbs",
  [MUSCLES.upperAbs]: "upperAbs",
  [MUSCLES.calves]: "calves",
  [MUSCLES.forearms]: "forearms",
  [MUSCLES.traps]: "traps",
  [MUSCLES.trapezius]: "traps",
  [MUSCLES.glutes]: "glutes",
  [MUSCLES.adductors]: "adductors",
  [MUSCLES.innerThighs]: "adductors",
  [MUSCLES.obliques]: "obliques",
  [MUSCLES.serratusAnterior]: "serratusAnterior",
  [MUSCLES.neck]: "neck",
  [MUSCLES.lowerBack]: "lowerBack",
};

// Priority: 3 = High, 2 = Medium, 1 = Low
const MUSCLE_PRIORITY_MAP: Record<string, number> = {
  chest: 13,
  pectorals: 13,
  back: 12,
  lats: 12,
  quads: 11,
  quadriceps: 11,
  femorals: 10,
  hamstrings: 10,
  triceps: 9,
  biceps: 8,
  glutes: 7,
  shoulders: 6,
  deltoids: 6,
  abs: 5,
  calves: 4,
  forearms: 3,
  traps: 2,
  obliques: 1,
};

export const getSortedMusclesWithImages = (muscleNames: string[]): MuscleDisplayData[] => {
  const displayData = muscleNames.map((name) => {
    // Find canonical key
    const canonicalKey =
      MUSCLE_ALIAS_MAP[name] ||
      (Object.keys(MUSCLES).find((key) => MUSCLES[key as keyof typeof MUSCLES] === name) as keyof typeof MUSCLE_IMAGES);

    const image = MUSCLE_IMAGES[canonicalKey];
    const priority = MUSCLE_PRIORITY_MAP[name] || 0;

    return {
      name,
      image,
      priority,
    };
  });

  // Sort by priority descending
  return displayData.sort((a, b) => b.priority - a.priority);
};
