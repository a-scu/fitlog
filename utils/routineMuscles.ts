import { Routine } from "@/types/Routine";
import { Exercise } from "@/types/Exercise";
import EXERCISES_DATA from "@/assets/data/exercises.json";
import { Set as SetType } from "@/types/Workout";

const EXERCISES = EXERCISES_DATA as Exercise[];

export const getRoutineMuscles = (sets: SetType[]) => {
  const targetMuscles = new Set<string>();
  const secondaryMuscles = new Set<string>();

  sets.forEach((set) => {
    const exerciseId = set.exerciseId;
    const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);
    if (exercise) {
      exercise.targetMuscles.forEach((m) => targetMuscles.add(m));
      exercise.secondaryMuscles.forEach((m) => secondaryMuscles.add(m));
    }
  });

  // Remove muscles that are already in target from secondary
  const filteredSecondary = Array.from(secondaryMuscles).filter((m) => !targetMuscles.has(m));

  return {
    target: Array.from(targetMuscles),
    secondary: filteredSecondary,
  };
};
