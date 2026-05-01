export type Rest = {
  id: string;
  type: "rest";
  duration: number; // in seconds
};

export type Step = Set | Rest;

export type Workout = {
  id: string;
  name: string;
  steps: Step[];
};

export type SetTypes = "effective" | "warm_up" | "approximation" | "custom";

/** Metric used for weight, reps and rir */
export interface Metric {
  value: string;
  min: string;
  max: string;
  isRange: boolean;
}

export interface Set {
  id: string;
  weight: Metric;
  reps: Metric;
  rir: Metric;
  exerciseId: string;
  type: SetTypes;
  customTypeName?: string;
  dropSets: DropSet[];
  partialReps: PartialReps;
  notes?: Notes;
}

export interface Notes {
  enabled: boolean;
  text: string;
}

export interface PartialReps {
  isRange: boolean;
  value: string; // used when isRange = false
  min: string; // used when isRange = true
  max: string; // used when isRange = true
  rom: string;
  customRom: string;
}

export interface DropSet {
  id: string;
  weight: Metric;
  reps: Metric;
  rir: Metric;
  partialReps: PartialReps;
}

export type ExerciseTranslations = {
  name: string;
  instructions?: string[];
};
