import "./styles/global.css";

import "@/lib/i18n";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import BottomTabsNavigator from "@/navigation/BottomTabsNavigator";
import ExerciseScreen from "@/screens/ExerciseScreen/ExerciseScreen";
import Header from "@/components/Header";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Modal from "@/components/modals/Modal";
import ExercisesScreen from "./screens/ExercisesScreen";
import Routine from "./screens/Routine/Routine";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <>
      <StatusBar style="dark" />
      <GestureHandlerRootView className="flex-1">
        <BottomSheetModalProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                header: (props) => <Header title={props.options.title} />,
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
                component={Routine}
                options={({ route }) => ({
                  headerShown: true,
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Modal />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
