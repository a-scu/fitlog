import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Header from "@/components/Header";

import BottomTabsNavigator from "./BottomTabsNavigator";

import RoutineScreen from "@/screens/Routine/RoutineScreen";
import CreateRoutineScreen from "@/screens/CreateRoutineScreen";
import EditRoutineScreen from "@/screens/EditRoutine/EditRoutineScreen";

import ExercisesScreen from "@/screens/ExercisesScreen";
import ExerciseScreen from "@/screens/Exercise/ExerciseScreen";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header title={props.options.title} />,
      }}
    >
      <Stack.Screen name="(tabs)" component={BottomTabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="exercises"
        component={ExercisesScreen}
        options={({ route }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="exercise"
        component={ExerciseScreen}
        options={({ route }) => ({
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="routine"
        component={RoutineScreen}
        options={({ route }) => ({
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="createRoutine"
        component={CreateRoutineScreen}
        options={({ route }) => ({
          headerShown: true,
        })}
      />
      <Stack.Screen
        name="editRoutine"
        component={EditRoutineScreen}
        options={({ route }) => ({
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}
