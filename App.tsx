import "./styles/global.css";
import "react-native-reanimated";
import "@/lib/i18n";
import * as Linking from "expo-linking";

import { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, AppState } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";

import { useThemeStore } from "@/stores/ThemeStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import Modal from "@/components/modals/Modal";

import RootStack from "./navigation/RootStack";
import OnboardingStack from "./navigation/OnboardingStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import AutoFinishNotification from "@/components/AutoFinishNotification";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useUserStore } from "./stores/UserStore";

GoogleSignin.configure({
  webClientId: "490750038028-j2998chpfpmdond14q9o7ut1v0m6limk.apps.googleusercontent.com",
});

SplashScreen.preventAutoHideAsync();

export default function App() {
  const appState = useRef(AppState.currentState);

  const [loaded, error] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // useColorScheme() already reflects Appearance.setColorScheme() set by ThemeStore
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  // Keep the store subscribed so the component re-renders when mode changes
  useThemeStore((s) => s.mode);
  const hasCompletedOnboarding = useGlobalSettingsStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // Ensure store is hydrated before checking timeout
      const checkTimeoutWhenHydrated = () => {
        if (useActiveWorkoutStore.persist.hasHydrated()) {
          useActiveWorkoutStore.getState().checkTimeout();
        } else {
          const unsub = useActiveWorkoutStore.persist.onFinishHydration(() => {
            useActiveWorkoutStore.getState().checkTimeout();
            unsub();
          });
        }
      };

      checkTimeoutWhenHydrated();
    }
  }, [loaded]);

  useEffect(() => {
    const unsubscribe = useUserStore.getState().initialize();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("App has come to the foreground!");
        useActiveWorkoutStore.getState().checkTimeout();
      }

      if (nextAppState === "background" || nextAppState === "inactive") {
        useActiveWorkoutStore.getState().updateInteractionTime();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const navTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationRef = useRef<any>(null);

  if (!loaded) {
    return null;
  }

  return (

    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <NavigationContainer
          ref={navigationRef}
          theme={navTheme}
          linking={{
            prefixes: [Linking.createURL("/"), "fitlog://"],
            config: {
              screens: {
                invite: "invite",
              },
            },
          }}
          onStateChange={(state) => {
            if (state) {
              const route = state.routes[state.index];
              useActiveWorkoutStore.getState().setCurrentRoute(route.name);
            }
          }}
          onReady={() => {
            const route = navigationRef.current?.getCurrentRoute();
            if (route) {
              useActiveWorkoutStore.getState().setCurrentRoute(route.name);
            }
          }}
        >
          <BottomSheetModalProvider>
            {!hasCompletedOnboarding ? <OnboardingStack /> : <RootStack />}
            <Modal />
            <AutoFinishNotification />
          </BottomSheetModalProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>

  );
}
