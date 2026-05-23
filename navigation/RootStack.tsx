import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";

import Header from "@/components/Header";

import BottomTabsNavigator from "./BottomTabsNavigator";

import ExercisesScreen from "@/screens/ExercisesScreen";
import ExerciseScreen from "@/screens/Exercise/ExerciseScreen";

import RoutineScreen from "@/screens/Routine/RoutineScreen";
import CreateRoutineScreen from "@/screens/Routine/CreateRoutineScreen";

import EditWorkoutScreen from "@/screens/EditWorkout/EditWorkoutScreen";
import CreateWorkoutScreen from "@/screens/EditWorkout/CreateWorkoutScreen";
import WorkoutScreen from "@/screens/Workout/WorkoutScreen";
// import ActiveWorkoutScreen from "@/screens/ActiveWorkout/ActiveWorkoutScreen";

import CreateWorkspaceScreen from "@/screens/CreateWorkspace/CreateWorkspaceScreen";
import WorkspaceScreen from "@/screens/Workspace/WorkspaceScreen";
import AddNoteScreen from "@/screens/AddNote/AddNoteScreen";
import WorkoutSessionScreen from "@/screens/ActiveWorkout/WorkoutSessionScreen";
import ActiveWorkoutBubble from "@/components/ActiveWorkoutBubble";
import InviteScreen from "@/screens/InviteScreen";
import WorkspaceSettingsScreen from "@/screens/WorkspaceSettings/WorkspaceSettingsScreen";
import PersonalWorkspaceSettingsScreen from "@/screens/PersonalWorkspaceSettings/PersonalWorkspaceSettingsScreen";
import ActiveWeekScreen from "@/screens/ActiveWeekScreen";
import LanguageScreen from "@/screens/Settings/LanguageScreen";

const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          sheetElevation: 0,
          header: (props) => <Header title={props.options.title} {...props} />,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          component={BottomTabsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="exercises"
          component={ExercisesScreen}
          options={({ route }) => ({
            headerShown: false,
            presentation: "formSheet",
            contentStyle: {
              backgroundColor: "transparent",
              shadowOpacity: 0,
              shadowColor: "transparent",
            },
          })}
        />
        <Stack.Screen name="exercise" component={ExerciseScreen} />

        <Stack.Screen name="routine" component={RoutineScreen} />
        <Stack.Screen name="createRoutine" component={CreateRoutineScreen} />

        <Stack.Screen name="editWorkout" component={EditWorkoutScreen} />
        <Stack.Screen name="createWorkout" component={CreateWorkoutScreen} />
        <Stack.Screen name="workout" component={WorkoutScreen} />

        <Stack.Screen
          name="workoutSession"
          component={WorkoutSessionScreen}
          options={{
            title: "Workout session",
            presentation: "formSheet",
            contentStyle: {
              backgroundColor: "transparent",
              shadowOpacity: 0,
              shadowColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="addNote"
          component={AddNoteScreen}
          options={{ title: "Add note" }}
        />
        <Stack.Screen
          name="workoutSessionSummary"
          component={
            require("@/screens/ActiveWorkout/WorkoutSessionSummaryScreen")
              .default
          }
          options={{ title: "Resumen" }}
        />

        <Stack.Screen
          name="createWorkspace"
          component={CreateWorkspaceScreen}
        />
        <Stack.Screen name="workspace" component={WorkspaceScreen} />
        <Stack.Screen
          name="workspaceSettings"
          component={WorkspaceSettingsScreen}
        />
        <Stack.Screen
          name="personalWorkspaceSettings"
          component={PersonalWorkspaceSettingsScreen}
        />
        <Stack.Screen
          name="invite"
          component={InviteScreen}
          options={{ headerShown: true, title: "Invitación" }}
        />

        <Stack.Screen
          name="activeWeek"
          component={ActiveWeekScreen}
          options={{ headerShown: true, title: "Semana activa" }}
        />
        <Stack.Screen
          name="language"
          component={LanguageScreen}
          options={{ headerShown: true, title: "Idioma" }}
        />
      </Stack.Navigator>
    </View>
  );
}
