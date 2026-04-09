export type ExerciseTranslations = {
  name: string;
  instructions?: string[];
};

export type SetTypes = "effective" | "warm_up" | "approximation" | "custom";

export interface Set {
  id: string;
  weight: string;
  reps: string;
  rir: string;
  type: SetTypes;
  customTypeName?: string;
  dropSets?: DropSet[];
  weightIsRange?: boolean;
  repsIsRange?: boolean;
  rirIsRange?: boolean;
  minWeight?: string;
  maxWeight?: string;
  minReps?: string;
  maxReps?: string;
  minRir?: string;
  maxRir?: string;
  partialReps: PartialReps;
  notes: Notes;
}

export interface Notes {
  enabled: boolean;
  text: string;
}

export interface PartialReps {
  count: string;
  rom: string;
  customRom?: string;
}

export interface DropSet {
  id: string;
  weight: string;
  reps: string;
  rir: string;
  partialReps: PartialReps;
}