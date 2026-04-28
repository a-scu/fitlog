import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Header from "@/components/Header";

import BottomTabsNavigator from "./BottomTabsNavigator";

import ExercisesScreen from "@/screens/ExercisesScreen";
import ExerciseScreen from "@/screens/Exercise/ExerciseScreen";

import RoutineScreen from "@/screens/Routine/RoutineScreen";
import CreateRoutineScreen from "@/screens/Routine/CreateRoutineScreen";

import WorkoutScreen from "@/screens/Workout/WorkoutScreen";
import EditWorkoutScreen from "@/screens/EditWorkout/EditWorkoutScreen";
import CreateWorkoutScreen from "@/screens/EditWorkout/CreateWorkoutScreen";

import CreateWorkspaceScreen from "@/screens/CreateWorkspace/CreateWorkspaceScreen";
import WorkspaceScreen from "@/screens/Workspace/WorkspaceScreen";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header title={props.options.title} />,
      }}
    >
      <Stack.Screen name="(tabs)" component={BottomTabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="exercises" component={ExercisesScreen} options={({ route }) => ({ headerShown: false })} />
      <Stack.Screen name="exercise" component={ExerciseScreen} />

      <Stack.Screen name="routine" component={RoutineScreen} />
      <Stack.Screen name="createRoutine" component={CreateRoutineScreen} />

      <Stack.Screen name="editWorkout" component={EditWorkoutScreen} />
      <Stack.Screen name="createWorkout" component={CreateWorkoutScreen} />
      <Stack.Screen name="workout" component={WorkoutScreen} />

      <Stack.Screen name="createWorkspace" component={CreateWorkspaceScreen} />
      <Stack.Screen name="workspace" component={WorkspaceScreen} />
    </Stack.Navigator>
  );
}
