export type RootStackParamList = {
  "(tabs)": undefined;
  exercises: undefined;
  exercise: { exercise: any };
  modal: undefined;
  routine: { routineId: string };
  editWorkout: { workoutId: string };
  createWorkspace: undefined;
  workspace: { workspaceId: string; initialTab?: "overview" | "routine" };
};

export type BottomTabParamList = {
  home: undefined;
  programs: undefined;
  modal: undefined;
  workspace: undefined;
  settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
