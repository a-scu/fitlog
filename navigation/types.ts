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
  activeWorkout: { workoutId: string };

  createWorkspace: undefined;
  workspace: { workspaceId: string; initialTab?: "overview" | "routine" };
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
