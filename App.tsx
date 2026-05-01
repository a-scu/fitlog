import "./styles/global.css";
import "react-native-reanimated";
import "@/lib/i18n";

import { useEffect } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";

import { useThemeStore } from "@/stores/ThemeStore";

import Modal from "@/components/modals/Modal";

import RootStack from "./navigation/RootStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // useColorScheme() already reflects Appearance.setColorScheme() set by ThemeStore
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  // Keep the store subscribed so the component re-renders when mode changes
  useThemeStore((s) => s.mode);

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

  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          {/* || isDark ? "light" : "dark" */}
          <StatusBar style={"dark"} />
          <NavigationContainer
            theme={navTheme}
            onStateChange={(state) => {
              if (state) {
                const route = state.routes[state.index];
                useActiveWorkoutStore.getState().setCurrentRoute(route.name);
              }
            }}
            onReady={() => {
              // Initial state update
              // We could potentially get the initial route here if needed
            }}
          >
            <BottomSheetModalProvider>
              <RootStack />
              <Modal />
            </BottomSheetModalProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </>
  );
}
