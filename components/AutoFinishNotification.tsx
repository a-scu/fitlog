import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View, AppState } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WORKOUT_INACTIVITY_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours

export default function AutoFinishNotification() {
  const {
    activeWorkoutId,
    lastInteractionTime,
    finishWorkout,
    updateInteractionTime,
  } = useActiveWorkoutStore();
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const appState = useRef(AppState.currentState);

  const checkTimeout = () => {
    if (!activeWorkoutId || !lastInteractionTime) return;

    const lastActive = new Date(lastInteractionTime).getTime();
    const now = new Date().getTime();
    const diffInMs = now - lastActive;

    if (diffInMs >= WORKOUT_INACTIVITY_TIMEOUT_MS) {
      // If more than 3 hours passed, finish workout and show local notification
      finishWorkout();
      setVisible(true);
    } else {
      // If less than 3 hours, we update the interaction time to "now"
      useActiveWorkoutStore.setState({
        lastInteractionTime: new Date().toISOString(),
      });
    }
  };

  // Check timeout when store is hydrated on mount
  useEffect(() => {
    const checkTimeoutWhenHydrated = () => {
      if (useActiveWorkoutStore.persist.hasHydrated()) {
        checkTimeout();
      } else {
        const unsub = useActiveWorkoutStore.persist.onFinishHydration(() => {
          checkTimeout();
          unsub();
        });
      }
    };
    checkTimeoutWhenHydrated();
  }, []);

  // Listen for AppState changes to check timeout or update interaction time
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkTimeout();
      }

      if (nextAppState === "background" || nextAppState === "inactive") {
        updateInteractionTime();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      // Show notification
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: insets.top + 10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View className="bg-neutral-950 p-4 rounded-2xl flex-row items-center shadow-lg border border-neutral-800">
        <View className="bg-amber-500/20 p-2 rounded-full mr-3">
          <Ionicons name="alert-circle" size={24} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm">
            Entreno Finalizado
          </Text>
          <Text className="text-neutral-400 text-xs">
            Tu sesión finalizó automáticamente por inactividad.
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} className="ml-2 p-1">
          <Ionicons name="close" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
