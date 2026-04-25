import { Routine } from "@/types/Routine";
import { Exercise } from "@/types/Exercise";
import EXERCISES_DATA from "@/assets/data/exercises.json";

const EXERCISES = EXERCISES_DATA as Exercise[];

export const getRoutineMuscles = (routine: Routine) => {
  const targetMuscles = new Set<string>();
  const secondaryMuscles = new Set<string>();

  routine.steps.forEach((step) => {
    if (step.type !== "rest") {
      // @ts-ignore - step is a Set here
      const exerciseId = step.exerciseId;
      const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);
      if (exercise) {
        exercise.targetMuscles.forEach((m) => targetMuscles.add(m));
        exercise.secondaryMuscles.forEach((m) => secondaryMuscles.add(m));
      }
    }
  });

  // Remove muscles that are already in target from secondary
  const filteredSecondary = Array.from(secondaryMuscles).filter((m) => !targetMuscles.has(m));

  return {
    target: Array.from(targetMuscles),
    secondary: filteredSecondary,
  };
};
