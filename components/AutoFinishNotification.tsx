import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AutoFinishNotification() {
  const { showAutoFinishNotification, clearAutoFinishNotification } = useActiveWorkoutStore();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (showAutoFinishNotification) {
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
  }, [showAutoFinishNotification]);

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
      clearAutoFinishNotification();
    });
  };

  if (!showAutoFinishNotification && fadeAnim._value === 0) return null;

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
      <View className="bg-neutral-900 p-4 rounded-2xl flex-row items-center shadow-lg border border-neutral-800">
        <View className="bg-amber-500/20 p-2 rounded-full mr-3">
          <Ionicons name="alert-circle" size={24} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm">Entreno Finalizado</Text>
          <Text className="text-neutral-400 text-xs">Tu sesión finalizó automáticamente por inactividad.</Text>
        </View>
        <TouchableOpacity onPress={handleClose} className="ml-2 p-1">
          <Ionicons name="close" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
