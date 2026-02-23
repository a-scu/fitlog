import { capitalize } from "@/lib/utils";
import { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Keyboard, Text, TouchableOpacity, View, useWindowDimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import Animated, { useSharedValue, useAnimatedRef, useAnimatedScrollHandler } from "react-native-reanimated";

import Instructions from "./components/Instructions";
import { ExerciseTranslations } from "./types";
import { ExerciseSet, listToObject, SET_HEIGHT, ExerciseSetItem } from "./components/Series";
import HeaderInfo from "./components/HeaderInfo";

type ExerciseScreenRouteProp = RouteProp<RootStackParamList, "exercise">;

export default function ExerciseScreen({ navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute<ExerciseScreenRouteProp>();
  const dimensions = useWindowDimensions();

  const exercise = route.params?.exercise;

  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([
    { id: "1", weight: "0", reps: "0", modifiers: ["warmup"] },
    { id: "2", weight: "0", reps: "0", modifiers: ["effective"] },
    { id: "3", weight: "0", reps: "0", modifiers: ["effective"] },
  ]);

  const positions = useSharedValue(listToObject(exerciseSets));
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

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

  const handleToggleUnit = async (newUnit: "kg" | "lbs") => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await AsyncStorage.setItem("preferred_weight_unit", newUnit);
    } catch (error) {
      console.error("Error saving preferred unit:", error);
    }
  };

  const handleUpdateWeight = (id: string, weight: string) => {
    setExerciseSets((prev) => prev.map((s) => (s.id === id ? { ...s, weight } : s)));
  };

  const handleUpdateReps = (id: string, reps: string) => {
    setExerciseSets((prev) => prev.map((s) => (s.id === id ? { ...s, reps } : s)));
  };

  const handleToggleModifier = (id: string, modifierId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const exists = s.modifiers.includes(modifierId);
        const newModifiers = exists ? s.modifiers.filter((m) => m !== modifierId) : [...s.modifiers, modifierId];
        return { ...s, modifiers: newModifiers };
      }),
    );
  };

  const handleDeleteSet = (id: string) => {
    setExerciseSets((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDragEnd = useCallback(() => {
    const newOrder = [...exerciseSets].sort((a, b) => (positions.value[a.id] ?? 0) - (positions.value[b.id] ?? 0));
    setExerciseSets(newOrder);
  }, [exerciseSets, positions]);

  const addSet = ({ weight, reps }: { weight?: string; reps?: string }) => {
    const newId = Math.random().toString(36).substring(7);
    const lastSet = exerciseSets[exerciseSets.length - 1];
    setExerciseSets((prev) => [
      ...prev,
      {
        id: newId,
        weight: weight ?? lastSet?.weight ?? "",
        reps: reps ?? lastSet?.reps ?? "10",
        modifiers: lastSet?.modifiers ?? ["effective"],
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener("keyboardDidHide", () => {
      Keyboard.dismiss();
    });
    return () => {
      keyboardSubscription.remove();
    };
  }, []);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const exerciseKey = exercise.name.toLowerCase();
  const translatedExercise = t(`exercises.${exerciseKey}`, { returnObjects: true, defaultValue: {} }) as ExerciseTranslations;

  const displayName = translatedExercise?.name ?? (exercise?.name ? capitalize(exercise.name) : "");
  const instructions = translatedExercise?.instructions ?? exercise?.instructions ?? [];

  useEffect(() => {
    if (displayName) {
      navigation.setOptions({ title: displayName });
    }
  }, [displayName, navigation]);

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

          <View className="flex-1 pb-2 pr-3 flex-row items-center">
            <View className="w-16">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Serie</Text>
            </View>

            <View className="w-20">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Peso</Text>
            </View>

            <View className="w-20">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Repeticiones</Text>
            </View>

            <View className="flex-1">
              <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Tipo de serie</Text>
            </View>

            <View className="flex-row gap-1.5 ml-4 items-center">
              <TouchableOpacity
                onPress={() => handleToggleUnit("kg")}
                className={`justify-center items-center w-9 py-2 border rounded ${unit === "kg" ? "border-red-200 bg-red-50" : "border-neutral-200"}`}
              >
                <Text className={`text-[10px] leading-none font-medium uppercase ${unit === "kg" ? "text-red-400" : "text-neutral-400"}`}>KG</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleToggleUnit("lbs")}
                className={`justify-center items-center w-9 py-2 border rounded ${unit === "lbs" ? "border-red-200 bg-red-50" : "border-neutral-200"}`}
              >
                <Text className={`text-[10px] leading-none font-medium uppercase ${unit === "lbs" ? "text-red-400" : "text-neutral-400"}`}>LBS</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: exerciseSets.length * SET_HEIGHT, position: "relative" }} className="border-t border-neutral-100">
            {exerciseSets.map((set, index) => (
              <ExerciseSetItem
                key={set.id}
                id={set.id}
                set={set}
                index={index}
                positions={positions}
                scrollY={scrollY}
                setCount={exerciseSets.length}
                onUpdateWeight={handleUpdateWeight}
                onUpdateReps={handleUpdateReps}
                onToggleModifier={handleToggleModifier}
                onDelete={handleDeleteSet}
                dimensions={dimensions}
                insets={insets}
                onDragEnd={handleDragEnd}
                listOffset={insets.top + (Platform.OS === "ios" ? 44 : 56) + 160} // Header + Gif section height
                duplicateSet={() => addSet({ weight: set.weight, reps: set.reps })}
                setsCount={exerciseSets.length}
              />
            ))}
          </View>

          <TouchableOpacity onPress={() => addSet({})} className="mx-3 flex-row items-center justify-center gap-2 rounded-md h-16">
            <Ionicons name="add" size={20} className="!text-neutral-900" />
            <Text className="font-semibold text-sm text-neutral-900">AGREGAR SERIE</Text>
          </TouchableOpacity>
        </View>

        {/* <View className="mb-8 w-full">
          <View className="mb-5 px-3 items-center flex-1 flex-row">
            <Text className="text-lg font-bold text-neutral-800">Colores</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="grow gap-3 px-3">
            {COLORS.map((color, index) => (
              <View key={index} className="size-10 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </ScrollView>
        </View> */}

        {/* Instructions */}
        <Instructions>{instructions}</Instructions>
      </View>
    </Animated.ScrollView>
  );
}
