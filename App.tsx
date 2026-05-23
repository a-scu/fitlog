import "react-native-reanimated";
import "./styles/global.css";
import "@/lib/i18n";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme, AppState } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useUserStore } from "./stores/UserStore";

import OnboardingStack from "./navigation/OnboardingStack";
import RootStack from "./navigation/RootStack";

import AutoFinishNotification from "@/components/AutoFinishNotification";
import Modal from "@/components/modals/Modal";

GoogleSignin.configure({
  webClientId:
    "490750038028-j2998chpfpmdond14q9o7ut1v0m6limk.apps.googleusercontent.com",
});

SplashScreen.preventAutoHideAsync();

export default function App() {
  const appState = useRef(AppState.currentState);

  const [loaded, error] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const hasCompletedOnboarding = useGlobalSettingsStore(
    (s) => s.hasCompletedOnboarding,
  );
  const user = useUserStore((s) => s.user);
  const isInitialized = useUserStore((s) => s.isInitialized);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isInitialized) {
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
  }, [loaded, isInitialized]);

  useEffect(() => {
    const unsubscribe = useUserStore.getState().initialize();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
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

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  // useThemeStore((s) => s.mode);
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <NavigationContainer
          theme={navTheme}
          linking={{
            prefixes: [Linking.createURL("/"), "fitlog://"],
            config: {
              screens: {
                invite: "invite",
              },
            },
          }}
        >
          <BottomSheetModalProvider>
            {!user || !hasCompletedOnboarding ? <OnboardingStack /> : <RootStack />}
            <Modal />
            <AutoFinishNotification />
          </BottomSheetModalProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
