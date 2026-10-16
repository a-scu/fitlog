import { SetTypes } from "./Workout";

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  duration?: number; // in seconds
  notes: string;
  isCompleted?: boolean;
  sets: LoggedSet[];
  workoutId?: string | null;
  isFreeWorkout?: boolean;
}

export interface LoggedSet {
  id: string;
  type?: SetTypes;
  exerciseId: string;
  completed: boolean;
  weight?: number;
  reps?: number;
  rir?: number;
  partialReps?: number;
  dropSets?: LoggedDropSet[];
}

export interface LoggedDropSet {
  id: string;
  plannedDropSetId?: string;
  weight: number;
  reps: number;
}
