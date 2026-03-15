import Animated, { cancelAnimation, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Platform, Text, TextInput, TouchableOpacity, View, Pressable, useWindowDimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import DropSetItem from "./DropSetItem";

import { clamp, objectMove, SET_HEIGHT, FAST_SPRING, SCROLL_THRESHOLD, DROP_SET_HEIGHT } from "./utils";

export default function ExerciseSetItem({
  id,
  set,
  index,
  positions,
  scrollY,
  setsCount,
  updateWeight,
  updateReps,
  updateRir,
  toggleModifier,
  deleteSet,
  onDragEnd,
  listOffset,
  itemHeights,
  duplicateSet,
  expanded,
  toggleExpand,
  addDropSet,
  updateDropSet,
  deleteDropSet,
}: any) {
  const dimensions = useWindowDimensions();
  const [isMoving, setIsMoving] = useState(false);
  const [anyFocused, setAnyFocused] = useState(false);
  const expansion = useSharedValue(0);
  const dropSetsHeightAnim = useSharedValue((set.dropSets?.length || 0) * DROP_SET_HEIGHT);
  const top = useSharedValue(index * SET_HEIGHT);
  const translateX = useSharedValue(0);
  const initialTopValue = useSharedValue(0);
  const initialAbsoluteY = useSharedValue(0);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const rirRef = useRef<TextInput>(null);

  useEffect(() => {
    expansion.value = withSpring(expanded ? 1 : 0, FAST_SPRING);
  }, [expanded]);

  useEffect(() => {
    dropSetsHeightAnim.value = withSpring(expanded ? (set.dropSets?.length || 0) * DROP_SET_HEIGHT : 0, FAST_SPRING);
  }, [set.dropSets?.length, expanded]);

  useEffect(() => {
    if (!isMoving && itemHeights) {
      const myPos = positions.value[id] ?? index;
      let targetTop = 0;
      for (const otherId in positions.value) {
        if (positions.value[otherId] < myPos) {
          targetTop += itemHeights.value[otherId] || SET_HEIGHT;
        }
      }
      top.value = withSpring(targetTop, FAST_SPRING);
    }
  }, [index, isMoving, expanded, id, itemHeights, set.dropSets?.length]);

  useAnimatedReaction(
    () => {
      const myPos = positions.value[id] ?? index;
      let targetTop = 0;
      if (itemHeights?.value) {
        for (const otherId in positions.value) {
          if (positions.value[otherId] < myPos) {
            targetTop += itemHeights.value[otherId] || SET_HEIGHT;
          }
        }
      }
      return targetTop;
    },
    (targetTop) => {
      if (!isMoving && targetTop !== undefined && targetTop !== null) {
        top.value = withSpring(targetTop, FAST_SPRING);
      }
    },
    [isMoving, itemHeights],
  );

  const reorderGesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .enabled(setsCount > 1)
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
      const maxTop = (setsCount - 1) * SET_HEIGHT;
      top.value = clamp(rawTop, 0, maxTop);

      // Determine new position based on the center of the item
      const newPosition = clamp(Math.floor((top.value + SET_HEIGHT / 2) / SET_HEIGHT), 0, setsCount - 1);

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
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > dimensions.width * 0.1) {
        translateX.value = withTiming(dimensions.width, {}, () => {
          runOnJS(deleteSet)(id);
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
    height: SET_HEIGHT + expansion.value * DROP_SET_HEIGHT + dropSetsHeightAnim.value,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5", // neutral-100
    transform: [{ translateX: translateX.value }, { scale: withSpring(isMoving ? 1.02 : 1, FAST_SPRING) }],
    zIndex: isMoving ? 100 : 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: withSpring(isMoving ? 0.2 : 0, FAST_SPRING),
    shadowRadius: 10,
    elevation: isMoving ? 5 : 0,
    opacity: isMoving ? 0.9 : 1,
    overflow: "hidden",
  }));

  const dropSetsContainerStyle = useAnimatedStyle(() => ({
    height: dropSetsHeightAnim.value,
    opacity: expansion.value,
    overflow: "hidden",
  }));

  const lowerRowStyle = useAnimatedStyle(() => ({
    height: expansion.value * DROP_SET_HEIGHT,
    opacity: expansion.value,
    overflow: "hidden",
  }));

  const combinedGesture = Gesture.Exclusive(reorderGesture, swipeGesture);

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
      <GestureDetector gesture={combinedGesture}>
        <View className="flex-1">
          {/* Upper Row */}
          <View style={{ height: SET_HEIGHT }} className="flex-row items-center px-4">
            <TouchableOpacity onPress={toggleExpand} className="size-8 items-center mr-4 justify-center rounded-full bg-red-50">
              <Text className="text-sm font-semibold text-red-400">{currentIndex + 1}</Text>
            </TouchableOpacity>

            <View className="flex-1 relative">
              <TextInput
                ref={weightRef}
                value={set.weight}
                placeholder="-"
                onChangeText={(t) => updateWeight(set.id, t)}
                keyboardType="numeric"
                style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle", height: SET_HEIGHT }}
                className="m-0 p-0 text-sm font-semibold text-center text-neutral-600"
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
                value={set.reps}
                placeholder="-"
                onChangeText={(t) => updateReps(set.id, t)}
                keyboardType="numeric"
                style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle", height: SET_HEIGHT }}
                className="m-0 p-0 text-sm text-center font-semibold text-neutral-600"
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
                value={set.rir}
                placeholder="-"
                onChangeText={(t) => updateRir(set.id, t)}
                keyboardType="numeric"
                style={{ includeFontPadding: false, textAlignVertical: "center", verticalAlign: "middle", height: SET_HEIGHT }}
                className="m-0 p-0 text-sm text-center font-semibold text-neutral-600"
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

            {/* <TouchableOpacity onPress={onToggleExpand} className="justify-center px-3" style={{ height: 64 }}>
              <Ionicons name="options-outline" size={20} className={expanded ? "!text-red-400" : "!text-neutral-400"} />
            </TouchableOpacity>

            <TouchableOpacity onPress={duplicateSet} className="justify-center px-3" style={{ height: 64 }}>
              <Ionicons name="duplicate-outline" size={20} className="!text-neutral-400" />
            </TouchableOpacity> */}
          </View>

          {/* Drop Sets */}
          <Animated.View style={dropSetsContainerStyle}>
            {set.dropSets?.map((dropSet: any, dsIndex: number) => (
              <DropSetItem
                key={dropSet.id}
                dropSet={dropSet}
                dsIndex={dsIndex}
                onUpdate={(field: any, val: any) => updateDropSet(dropSet.id, field, val)}
                onDelete={() => deleteDropSet(dropSet.id)}
                setAnyFocused={setAnyFocused}
                dimensions={dimensions}
                parentSwipeGesture={swipeGesture}
              />
            ))}
          </Animated.View>

          {/* Lower Row (Expanded Options) */}
          <Animated.View style={lowerRowStyle} className="flex-row items-center px-4 white gap-4">
            <View className="flex-row h-full items-center gap-1">
              <TouchableOpacity onPress={addDropSet} className="items-center h-full justify-center">
                <Text className="text-xs text-cyan-400 bg-cyan-100 font-medium px-1 py-0.5 rounded">Serie Efectiva</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={addDropSet} className="items-center h-full justify-center">
                <Text className="text-xs text-purple-400 bg-purple-100 font-medium px-1 py-0.5 rounded">Al fallo</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={addDropSet} className="ml-auto items-center h-full flex-row gap-1">
              <Ionicons name="add-circle-outline" size={14} className="!text-neutral-400" />
              <Text className="text-xs text-neutral-400">Add Drop Set</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={duplicateSet} className="items-center h-full flex-row gap-1">
              <Ionicons name="duplicate-outline" size={14} className="!text-neutral-400" />
              <Text className="text-xs text-neutral-400">Duplicate Set</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
