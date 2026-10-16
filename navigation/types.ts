export type RootStackParamList = {
  "(tabs)": undefined;
  modal: undefined;

  exercises: undefined;
  exercise: { exercise: any };

  createRoutine: { workspaceId: string };
  routine: { routineId: string };

  createWorkout: undefined;
  editWorkout: { workoutId: string };
  workout: { workoutId: string };
  workoutSession: { date?: string | Date };
  workoutSessionSummary: { workoutSessionDate: string | Date };
  addNote: { date: Date };

  createWorkspace: undefined;
  workspace: { workspaceId: string; initialTab?: "overview" | "routine" };
  workspaceSettings?: { workspaceId?: string };
  invite: { id: string };
  activeWeek: undefined;
  language: undefined;
  programs: undefined;
  activeWorkout: undefined;
};

export type BottomTabParamList = {
  dashboard: undefined;
  diary: undefined;
  workspaces: undefined;
  settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
