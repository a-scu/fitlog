import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureDetector, Gesture, NativeViewGestureHandler } from "react-native-gesture-handler";
import Animated, { cancelAnimation, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { clamp, objectMove, SET_HEIGHT, FAST_SPRING, SCROLL_THRESHOLD, ExerciseSet } from "./utils";
import { SET_TYPES } from "@/constants/SetTypes";
import { useModalStore } from "@/store/useModalStore";

export default function ExerciseSetItem({
  id,
  set,
  index,
  positions,
  scrollY,
  setCount,
  onUpdateWeight,
  onUpdateReps,
  onToggleModifier,
  onDelete,
  dimensions,
  insets,
  onDragEnd,
  listOffset,
  duplicateSet,
  setsCount,
}: any) {
  const { showModal, hideModal } = useModalStore();
  const [isMoving, setIsMoving] = useState(false);
  const [anyFocused, setAnyFocused] = useState(false);
  const top = useSharedValue(index * SET_HEIGHT);
  const translateX = useSharedValue(0);
  const initialTopValue = useSharedValue(0);
  const initialAbsoluteY = useSharedValue(0);

  // Refs for NativeViewGestureHandler on each TextInput
  const weightNativeRef = useRef<any>(null);
  const repsNativeRef = useRef<any>(null);

  useEffect(() => {
    if (!isMoving) {
      top.value = withSpring(index * SET_HEIGHT, FAST_SPRING);
    }
  }, [index, isMoving]);

  useAnimatedReaction(
    () => positions.value[id],
    (currentPos, prevPos) => {
      if (currentPos !== prevPos && !isMoving && currentPos !== undefined) {
        top.value = withSpring(currentPos * SET_HEIGHT, FAST_SPRING);
      }
    },
    [isMoving],
  );

  const reorderGesture = Gesture.Pan()
    .minDistance(0) // Activate immediately on first movement
    .onStart((event) => {
      cancelAnimation(top);
      initialTopValue.value = top.value;
      initialAbsoluteY.value = event.absoluteY + scrollY.value;
      runOnJS(setIsMoving)(true);
      if (Platform.OS !== "web") {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
    })
    .onUpdate((event) => {
      // Auto-scroll logic stays the same
      const currentAbsoluteY = event.absoluteY + scrollY.value;
      const positionInList = event.absoluteY + scrollY.value - listOffset; // Only for scroll threshold check

      if (positionInList <= scrollY.value + SCROLL_THRESHOLD) {
        scrollY.value = withTiming(0, { duration: 1500 });
      } else if (positionInList >= scrollY.value + dimensions.height - (listOffset + SCROLL_THRESHOLD)) {
        scrollY.value = withTiming(1000, { duration: 1500 });
      } else {
        cancelAnimation(scrollY);
      }

      // NO JUMP: New top is just the initial top plus the delta movement
      const deltaY = currentAbsoluteY - initialAbsoluteY.value;
      const rawTop = initialTopValue.value + deltaY;
      const maxTop = (setCount - 1) * SET_HEIGHT;
      top.value = clamp(rawTop, 0, maxTop);

      // Determine new position based on the center of the item
      const newPosition = clamp(Math.floor((top.value + SET_HEIGHT / 2) / SET_HEIGHT), 0, setCount - 1);

      if (newPosition !== positions.value[id]) {
        positions.value = objectMove(positions.value, positions.value[id], newPosition);
        if (Platform.OS !== "web") {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    })
    .onEnd(() => {
      // Snap to final position in fixed 100ms regardless of distance
      top.value = withTiming(positions.value[id] * SET_HEIGHT, { duration: 100 }, (finished) => {
        if (finished) {
          runOnJS(setIsMoving)(false);
        }
      });
      runOnJS(onDragEnd)();
    });

  const swipeGesture = Gesture.Pan()
    .enabled(!anyFocused && setsCount > 1) // Disable when a TextInput is focused to avoid conflicting with text cursor
    .activeOffsetX(20) // Only start horizontal swipe after 20px
    .failOffsetY([-15, 15]) // If moving vertically more than 15px, fail and let ScrollView take over
    .simultaneousWithExternalGesture(weightNativeRef, repsNativeRef) // Allow swipe even when gestures start over TextInputs
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > dimensions.width * 0.1) {
        translateX.value = withTiming(dimensions.width, {}, () => {
          runOnJS(onDelete)(id);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Compose swipe with Native so TextInput and other native views can still receive taps
  // const composedSwipe = Gesture.Simultaneous(swipeGesture, Gesture.Native());

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: top.value,
    height: SET_HEIGHT,
    backgroundColor: "white",
    transform: [{ translateX: translateX.value }, { scale: withSpring(isMoving ? 1.02 : 1, FAST_SPRING) }],
    zIndex: isMoving ? 100 : 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: withSpring(isMoving ? 0.2 : 0, FAST_SPRING),
    shadowRadius: 10,
    elevation: isMoving ? 5 : 0,
  }));

  const [currentIndex, setCurrentIndex] = useState(index);
  useAnimatedReaction(
    () => (positions.value[id] !== undefined ? positions.value[id] : index),
    (pos) => {
      runOnJS(setCurrentIndex)(pos);
    },
    [index],
  );

  return (
    <Animated.View style={animatedStyle}>
      <GestureDetector gesture={swipeGesture}>
        <Animated.View>
          <View style={{ height: SET_HEIGHT }} className="flex-row items-center bg-white border-b border-neutral-100">
            {/* Content row */}
            <View className="flex-1 flex-row items-center h-full pl-4">
              <View className="size-8 mr-4 items-center justify-center rounded-full bg-neutral-100">
                <Text className="text-sm font-bold text-neutral-400">{currentIndex + 1}</Text>
              </View>

              <View className="flex-1 flex-row items-center">
                <View className="w-20">
                  <NativeViewGestureHandler ref={weightNativeRef} disallowInterruption={false}>
                    <TextInput
                      value={set.weight}
                      placeholder="0"
                      onChangeText={(t) => onUpdateWeight(set.id, t)}
                      keyboardType="numeric"
                      style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle" }}
                      className="m-0 p-0 text-base font-semibold text-center text-neutral-600"
                      selectTextOnFocus
                      onFocus={() => setAnyFocused(true)}
                      onBlur={() => setAnyFocused(false)}
                    />
                  </NativeViewGestureHandler>
                </View>

                <View className="w-20">
                  <NativeViewGestureHandler ref={repsNativeRef} disallowInterruption={false}>
                    <TextInput
                      value={set.reps}
                      placeholder="0"
                      onChangeText={(t) => onUpdateReps(set.id, t)}
                      keyboardType="numeric"
                      style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle" }}
                      className="m-0 p-0 text-base text-center font-semibold text-neutral-600"
                      selectTextOnFocus
                      onFocus={() => setAnyFocused(true)}
                      onBlur={() => setAnyFocused(false)}
                    />
                  </NativeViewGestureHandler>
                </View>

                <View className="flex-1">
                  <TouchableOpacity
                    onPress={() =>
                      showModal({
                        title: "Modificadores de serie",
                        content: (
                          <View className="gap-3">
                            {SET_TYPES.map((t) => {
                              const isActive = set.modifiers.includes(t.id);
                              return (
                                <TouchableOpacity
                                  key={t.id}
                                  className={`flex-row items-center p-4 rounded-xl ${
                                    isActive ? t.color + " border border-" + t.textColor.replace("text-", "").split("/")[0] : "bg-neutral-50"
                                  }`}
                                  onPress={() => {
                                    onToggleModifier(set.id, t.id);
                                    if (Platform.OS !== "web") {
                                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                  }}
                                >
                                  <View className={`size-3 rounded-full mr-3 ${t.textColor.replace("text-", "bg-").split("/")[0]}`} />
                                  <Text className={`text-base font-semibold ${t.textColor.split("/")[0]}`}>{t.label}</Text>
                                  {isActive && <Ionicons name="checkmark" size={20} className={`ml-auto ${t.textColor.split("/")[0]}`} />}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        ),
                        snapPoints: ["55%"],
                      })
                    }
                    className="items-center justify-center h-full"
                  >
                    <View className="flex-row gap-1 flex-wrap justify-center px-1">
                      {set.modifiers && set.modifiers.length > 0 ? (
                        set.modifiers.map((modId: string) => {
                          const mod = SET_TYPES.find((t) => t.id === modId);
                          if (!mod) return null;
                          return (
                            <View key={modId} className={`px-2 py-0.5 rounded-md ${mod.color}`}>
                              <Text className={`text-[10px] font-bold ${mod.textColor.split("/")[0]} text-center`} style={{ includeFontPadding: false }}>
                                {mod.label}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <View className="px-2 py-0.5 rounded-md bg-neutral-100">
                          <Text className="text-[10px] font-bold text-neutral-400 text-center">Normal</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={duplicateSet} className="h-full justify-center px-4">
                <Ionicons name="duplicate-outline" size={20} className="!text-neutral-400" />
              </TouchableOpacity>
            </View>

            {/* Reorder Handle */}
            <GestureDetector gesture={reorderGesture}>
              <View className="items-center pr-3 pl-4 justify-center h-full">
                <Ionicons name="apps-outline" size={20} className="!text-neutral-400" />
              </View>
            </GestureDetector>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
