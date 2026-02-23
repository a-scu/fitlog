export type RootStackParamList = {
  "(tabs)": undefined;
  exercise: { exercise: any };
  modal: undefined;
};

export type BottomTabParamList = {
  exercises: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}



