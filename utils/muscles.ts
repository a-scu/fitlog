import { MUSCLES, MUSCLE_IMAGES } from "@/constants/Muscles";

export type MuscleDisplayData = {
  name: string;
  image: any;
  priority: number;
};

// Asocia los valores de los músculos a una clave canónica en MUSCLE_IMAGES
const MUSCLE_ALIAS_MAP: Record<string, keyof typeof MUSCLE_IMAGES> = {
  [MUSCLES.chest]: "chest",
  [MUSCLES.pectorals]: "chest",
  [MUSCLES.upperChest]: "chest",
  [MUSCLES.back]: "lats", // Alternativa (fallback) a lats si falta la imagen de la espalda
  [MUSCLES.latissimusDorsi]: "lats",
  [MUSCLES.lats]: "lats",
  [MUSCLES.quadriceps]: "quads",
  [MUSCLES.quads]: "quads",
  [MUSCLES.hamstrings]: "femorals",
  [MUSCLES.femorals]: "femorals",
  [MUSCLES.deltoids]: "shoulders",
  [MUSCLES.shoulders]: "shoulders",
  [MUSCLES.rearDeltoids]: "shoulders",
  [MUSCLES.delts]: "shoulders",
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
  [MUSCLES.adductors]: "abductors",
  [MUSCLES.innerThighs]: "abductors",
  [MUSCLES.obliques]: "obliques",
  [MUSCLES.serratusAnterior]: "serratusAnterior",
  [MUSCLES.neck]: "neck",
  [MUSCLES.lowerBack]: "lowerBack",
};

const MUSCLE_PRIORITY_MAP: Record<string, number> = {
  chest: 13,
  back: 12,
  lats: 12,
  quads: 11,
  quadriceps: 11,
  femorals: 10,
  triceps: 9,
  biceps: 8,
  lowerBack: 7,
  glutes: 7,
  shoulders: 6,
  deltoids: 6,
  abs: 5,
  calves: 4,
  forearms: 3,
  traps: 2,
  obliques: 1,
};

/**
 * Obtiene la clave canónica (camelCase) de un músculo que se corresponde con
 * las claves definidas en MUSCLE_IMAGES o MUSCLES.
 * Utiliza MUSCLE_ALIAS_MAP si está disponible, o realiza una búsqueda inversa en MUSCLES.
 */
export const getCanonicalMuscleKey = (
  muscleName: string,
): keyof typeof MUSCLE_IMAGES => {
  return (
    MUSCLE_ALIAS_MAP[muscleName] ||
    (Object.keys(MUSCLES).find(
      (key) => MUSCLES[key as keyof typeof MUSCLES] === muscleName,
    ) as keyof typeof MUSCLE_IMAGES)
  );
};

/**
 * Obtiene el nombre canónico (legible, ej. "lower back" en lugar de "lowerBack")
 * resolviendo el músculo a su alias canónico en MUSCLES.
 */
export const getCanonicalMuscleName = (muscleName: string): string => {
  const canonicalKey = getCanonicalMuscleKey(muscleName);
  if (canonicalKey && canonicalKey in MUSCLES) {
    return MUSCLES[canonicalKey as keyof typeof MUSCLES];
  }
  return muscleName;
};

/**
 * Determina si un músculo es principal/válido comprobando si él o su clave canónica
 * tienen una prioridad asignada en el mapa de prioridades.
 */
export const isValidMuscle = (muscleName: string): boolean => {
  const canonicalKey = getCanonicalMuscleKey(muscleName);
  return (
    muscleName in MUSCLE_PRIORITY_MAP ||
    (canonicalKey !== undefined &&
      (canonicalKey as string) in MUSCLE_PRIORITY_MAP)
  );
};

/**
 * Obtiene la prioridad numérica de un músculo a partir de MUSCLE_PRIORITY_MAP,
 * resolviendo su alias si es necesario. Retorna 0 si no se encuentra.
 */
export const getMusclePriority = (muscleName: string): number => {
  const canonicalKey = getCanonicalMuscleKey(muscleName);
  return (
    MUSCLE_PRIORITY_MAP[canonicalKey] || MUSCLE_PRIORITY_MAP[muscleName] || 0
  );
};

/**
 * Retorna el recurso de imagen asociado al músculo.
 * Si el músculo no es válido (no es principal), retorna undefined.
 */
export const getMuscleImage = (muscleName: string) => {
  if (!isValidMuscle(muscleName)) return undefined;
  const canonicalKey = getCanonicalMuscleKey(muscleName);
  return MUSCLE_IMAGES[canonicalKey];
};

/**
 * Toma una lista de nombres de músculos, los filtra para conservar solo los principales,
 * asocia su imagen y prioridad, y los devuelve ordenados de mayor a menor prioridad.
 */
export const getSortedMusclesWithImages = (
  muscleNames: string[],
): MuscleDisplayData[] => {
  const displayData = muscleNames.filter(isValidMuscle).map((name) => {
    const canonicalKey = getCanonicalMuscleKey(name);
    const image = MUSCLE_IMAGES[canonicalKey];
    const priority = getMusclePriority(name);

    return {
      name,
      image,
      priority,
    };
  });

  // Ordena por prioridad de forma descendente
  return displayData.sort((a, b) => b.priority - a.priority);
};

import EXERCISES from "@/constants/Exercises";
import type { Set } from "@/types/Workout";

/**
 * Ordena un arreglo de nombres de músculos por su prioridad asignada de forma descendente.
 */
const sortMusclesByPriority = (muscles: string[]): string[] => {
  return [...muscles].sort(
    (a, b) => getMusclePriority(b) - getMusclePriority(a),
  );
};

/**
 * Analiza las series de un entrenamiento y devuelve los músculos trabajados agrupados en:
 * - target: Músculos principales con imagen.
 * - secondary: Músculos secundarios del ejercicio, además de los principales sin imagen asociada.
 * Ambos listados son deduplicados y ordenados por prioridad de forma descendente.
 */
export const getWorkoutMuscles = (sets: Set[]) => {
  const targetMuscles = new Set<string>();
  const secondaryMuscles = new Set<string>();

  sets.forEach((set) => {
    const exerciseId = set.exerciseId;
    const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);
    if (exercise) {
      exercise.targetMuscles.forEach((m) => {
        if (isValidMuscle(m)) {
          targetMuscles.add(getCanonicalMuscleName(m));
        } else {
          secondaryMuscles.add(getCanonicalMuscleName(m));
        }
      });
      exercise.secondaryMuscles.forEach((m) => {
        secondaryMuscles.add(getCanonicalMuscleName(m));
      });
    }
  });

  // Elimina de la lista de secundarios los músculos que ya están en la de principales
  const filteredSecondary = Array.from(secondaryMuscles).filter(
    (m) => !targetMuscles.has(m),
  );

  return {
    target: sortMusclesByPriority(Array.from(targetMuscles)),
    secondary: sortMusclesByPriority(filteredSecondary),
  };
};
