import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DROP_SET_HEIGHT } from "./utils";

export default function DropSetItem({ dropSet, dsIndex, onUpdate, onDelete, setAnyFocused, dimensions, parentSwipeGesture }: any) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const translateX = useSharedValue(0);
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const rirRef = useRef<TextInput>(null);

  const localSwipe = Gesture.Pan()
    .activeOffsetX(20)
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > dimensions.width * 0.1) {
        translateX.value = withTiming(dimensions.width, {}, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Combine with root gesture so we don't block swipe
  const finalGesture = Gesture.Exclusive(localSwipe, parentSwipeGesture);

  const style = useAnimatedStyle(() => ({
    height: DROP_SET_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={finalGesture}>
      <Animated.View style={style} className="bg-red-200 pr-4">
        <View className="items-center mx-4 w-8 justify-center">
          <Ionicons name="return-down-forward" size={14} className="!text-neutral-400" />
          <Text className="text-xs text-neutral-400">{dsIndex + 1}</Text>
        </View>

        <View className="flex-1 relative">
          <TextInput
            ref={weightRef}
            value={dropSet.weight}
            placeholder="-"
            onChangeText={(t) => onUpdate("weight", t)}
            keyboardType="numeric"
            style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle", height: DROP_SET_HEIGHT }}
            className="m-0 p-0 text-xs font-regular text-center text-neutral-600"
            selectTextOnFocus
            onFocus={() => {
              setFocusedField("weight");
              setAnyFocused(true);
            }}
            onBlur={() => {
              setFocusedField(null);
              setAnyFocused(false);
            }}
          />
          {focusedField !== "weight" && <Pressable onPress={() => weightRef.current?.focus()} className="absolute inset-0 z-10" />}
        </View>

        <View className="flex-1 relative">
          <TextInput
            ref={repsRef}
            value={dropSet.reps}
            placeholder="-"
            onChangeText={(t) => onUpdate("reps", t)}
            keyboardType="numeric"
            style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle", height: DROP_SET_HEIGHT }}
            className="m-0 p-0 text-xs text-center font-regular text-neutral-600"
            selectTextOnFocus
            onFocus={() => {
              setFocusedField("reps");
              setAnyFocused(true);
            }}
            onBlur={() => {
              setFocusedField(null);
              setAnyFocused(false);
            }}
          />
          {focusedField !== "reps" && <Pressable onPress={() => repsRef.current?.focus()} className="absolute inset-0 z-10" />}
        </View>

        <View className="flex-1 relative">
          <TextInput
            ref={rirRef}
            value={dropSet.rir}
            placeholder="-"
            onChangeText={(t) => onUpdate("rir", t)}
            keyboardType="numeric"
            style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle", height: DROP_SET_HEIGHT }}
            className="m-0 p-0 text-xs text-center font-regular text-neutral-600"
            selectTextOnFocus
            onFocus={() => {
              setFocusedField("rir");
              setAnyFocused(true);
            }}
            onBlur={() => {
              setFocusedField(null);
              setAnyFocused(false);
            }}
          />
          {focusedField !== "rir" && <Pressable onPress={() => rirRef.current?.focus()} className="absolute inset-0 z-10" />}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
