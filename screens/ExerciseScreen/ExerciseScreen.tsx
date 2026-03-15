import { capitalize } from "@/lib/utils";
import { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Keyboard, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import Animated, { useSharedValue, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, withSpring } from "react-native-reanimated";

import Instructions from "./components/Instructions";
import { ExerciseTranslations } from "./types";
import { ExerciseSet, listToObject, SET_HEIGHT, ExerciseSetItem, FAST_SPRING, DROP_SET_HEIGHT } from "./components/Series";
import HeaderInfo from "./components/HeaderInfo";
// import Colors from "./components/Series/Colors";

interface ExerciseScreenProps {
  navigation: any;
  route: RouteProp<RootStackParamList, "exercise">;
}

export default function ExerciseScreen({ navigation, route }: ExerciseScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const exercise = route.params?.exercise;

  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([{ id: "1", weight: "", reps: "", rir: "", modifiers: ["effective"] }]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  const positions = useSharedValue(listToObject(exerciseSets));
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const itemHeights = useSharedValue<Record<string, number>>({});

  const exerciseKey = exercise.name.toLowerCase();
  const translatedExercise = t(`exercises.${exerciseKey}`, { returnObjects: true, defaultValue: {} }) as ExerciseTranslations;
  const displayName = translatedExercise?.name ?? (exercise?.name ? capitalize(exercise.name) : "");
  const instructions = translatedExercise?.instructions ?? exercise?.instructions ?? [];

  useEffect(() => {
    positions.value = listToObject(exerciseSets);
  }, [exerciseSets]);

  useEffect(() => {
    const loadUnit = async () => {
      try {
        const storedUnit = await AsyncStorage.getItem("preferred_weight_unit");
        if (storedUnit === "kg" || storedUnit === "lbs") {
          setUnit(storedUnit);
        }
      } catch (error) {
        console.error("Error loading preferred unit:", error);
      }
    };

    loadUnit();
  }, []);

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener("keyboardDidHide", () => {
      Keyboard.dismiss();
    });
    return () => {
      keyboardSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (displayName) {
      navigation.setOptions({ title: displayName });
    }
  }, [displayName, navigation]);

  useEffect(() => {
    const newHeights: Record<string, number> = {};
    exerciseSets.forEach((s) => {
      newHeights[s.id] = SET_HEIGHT + (expandedId === s.id ? SET_HEIGHT + (s.dropSets?.length || 0) * DROP_SET_HEIGHT : 0);
    });
    itemHeights.value = newHeights;
  }, [exerciseSets, expandedId]);

  const toggleUnit = async (newUnit: "kg" | "lbs") => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await AsyncStorage.setItem("preferred_weight_unit", newUnit);
    } catch (error) {
      console.error("Error saving preferred unit:", error);
    }
  };

  const toggleModifier = (id: string, modifierId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const exists = s.modifiers.includes(modifierId);
        const newModifiers = exists ? s.modifiers.filter((m) => m !== modifierId) : [...s.modifiers, modifierId];
        return { ...s, modifiers: newModifiers };
      }),
    );
  };

  const updateWeight = (id: string, weight: string) => {
    setExerciseSets((prev) => prev.map((s) => (s.id === id ? { ...s, weight } : s)));
  };

  const updateReps = (id: string, reps: string) => {
    setExerciseSets((prev) => prev.map((s) => (s.id === id ? { ...s, reps } : s)));
  };

  const updateRir = (id: string, rir: string) => {
    setExerciseSets((prev) => prev.map((s) => (s.id === id ? { ...s, rir } : s)));
  };

  const addSet = ({ weight, reps, rir }: { weight?: string; reps?: string; rir?: string }) => {
    const newId = Math.random().toString(36).substring(7);
    const lastSet = exerciseSets[exerciseSets.length - 1];
    setExerciseSets((prev) => [
      ...prev,
      {
        id: newId,
        weight: weight ?? lastSet?.weight ?? "",
        reps: reps ?? lastSet?.reps ?? "10",
        rir: rir ?? lastSet?.rir ?? "0",
        modifiers: lastSet?.modifiers ?? ["effective"],
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteSet = (id: string) => {
    setExerciseSets((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addDropSet = (setId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        const newDropSetId = Math.random().toString(36).substring(7);
        const newDropSet = {
          id: newDropSetId,
          weight: s.dropSets?.length ? s.dropSets[s.dropSets.length - 1].weight : s.weight,
          reps: s.dropSets?.length ? s.dropSets[s.dropSets.length - 1].reps : s.reps,
          rir: s.dropSets?.length ? s.dropSets[s.dropSets.length - 1].rir : s.rir,
        };
        return { ...s, dropSets: [...(s.dropSets || []), newDropSet] };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateDropSet = (setId: string, dropSetId: string, field: "weight" | "reps" | "rir", value: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return {
          ...s,
          dropSets: s.dropSets?.map((ds) => (ds.id === dropSetId ? { ...ds, [field]: value } : ds)),
        };
      }),
    );
  };

  const deleteDropSet = (setId: string, dropSetId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return { ...s, dropSets: s.dropSets?.filter((ds) => ds.id !== dropSetId) };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDragEnd = useCallback(() => {
    const newOrder = [...exerciseSets].sort((a, b) => (positions.value[a.id] ?? 0) - (positions.value[b.id] ?? 0));
    setExerciseSets(newOrder);
  }, [exerciseSets, positions]);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const setsContainerStyle = useAnimatedStyle(() => {
    let totalHeight = 0;
    for (const key in itemHeights.value) {
      totalHeight += itemHeights.value[key];
    }
    return {
      height: withSpring(totalHeight, FAST_SPRING),
      position: "relative",
    };
  });

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t("screens.exercise.notFound")}</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Content */}
      <View className="pb-3">
        {/* Header Info */}
        <HeaderInfo exercise={exercise} />

        {/* Series List */}
        <View className="mb-5">
          <View className="mb-3 px-3 items-center flex-1 flex-row">
            <Text className="text-lg font-bold text-neutral-800">Series</Text>
          </View>

          {/* List Header */}

          <View className="flex-1 pb-2 pr-4 flex-row items-center">
            <View className="w-16">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Serie</Text>
            </View>

            <TouchableOpacity onPress={() => toggleUnit(unit === "kg" ? "lbs" : "kg")} className="flex-1 flex-row items-center justify-center gap-0.5">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Peso ({unit})</Text>
              <Ionicons name="repeat" size={12} className="!text-neutral-400" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Reps</Text>
            </View>

            <View className="flex-1">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">RIR</Text>
            </View>
          </View>

          <Animated.View style={setsContainerStyle} className="border-t border-neutral-100">
            {exerciseSets.map((set, index) => (
              <ExerciseSetItem
                key={set.id}
                id={set.id}
                set={set}
                index={index}
                positions={positions}
                scrollY={scrollY}
                setsCount={exerciseSets.length}
                updateWeight={updateWeight}
                updateReps={updateReps}
                updateRir={updateRir}
                toggleModifier={toggleModifier}
                deleteSet={deleteSet}
                onDragEnd={handleDragEnd}
                listOffset={insets.top + (Platform.OS === "ios" ? 44 : 56) + 160} // Header + Gif section height
                itemHeights={itemHeights}
                duplicateSet={() => addSet({ weight: set.weight, reps: set.reps, rir: set.rir })}
                expanded={expandedId === set.id}
                toggleExpand={() => setExpandedId(expandedId === set.id ? null : set.id)}
                addDropSet={() => addDropSet(set.id)}
                updateDropSet={(dropSetId: string, field: "weight" | "reps" | "rir", value: string) => updateDropSet(set.id, dropSetId, field, value)}
                deleteDropSet={(dropSetId: string) => deleteDropSet(set.id, dropSetId)}
              />
            ))}
          </Animated.View>

          <TouchableOpacity onPress={() => addSet({})} className="mx-3 flex-row items-center justify-center gap-2 rounded-md h-16">
            <Ionicons name="add" size={20} className="!text-neutral-900" />
            <Text className="font-semibold text-sm text-neutral-900">AGREGAR SERIE</Text>
          </TouchableOpacity>
        </View>

        {/* <Colors /> */}
        <Instructions>{instructions}</Instructions>
      </View>
    </Animated.ScrollView>
  );
}
