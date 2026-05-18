export type RootStackParamList = {
  "(tabs)": undefined;
  modal: undefined;

  exercises: undefined;
  exercise: { exercise: any };

  createRoutine: undefined;
  routine: { routineId: string };

  createWorkout: undefined;
  editWorkout: { workoutId: string };
  workout: { workoutId: string };
  workoutSession: { date?: string | Date };
  workoutSessionSummary: { workoutSessionDate: string | Date };
  addNote: { date: Date };

  createWorkspace: undefined;
  workspace: { workspaceId: string; initialTab?: "overview" | "routine" };
  workspaceSettings: { workspaceId: string };
  invite: { id: string };
  weeks: { date: Date };
};

export type BottomTabParamList = {
  dashboard: undefined;
  programs: undefined;
  workspaces: undefined;
  settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
