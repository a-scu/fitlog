import { SetTypes } from "./Workout";

export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO string
  duration: number; // in seconds
  notes: string;
  status?: "in_progress" | "completed";
  sets: LoggedSet[];
  templateWorkoutId?: string | null;
  routineId?: string | null;
}

export type LoggedSet = {
  id: string;
  type?: SetTypes;
  exerciseId: string;
  completed: boolean;
  weight?: string;
  reps?: string;
  rir?: string;
  dropSets?: [{ id: string; weight: number; reps: number }];
  partialReps?: number;
};
