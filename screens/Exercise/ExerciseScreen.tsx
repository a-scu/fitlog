import { capitalize } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEffect } from "react";

import Instructions from "./components/Instructions";
import { ExerciseTranslations } from "@/types/Workout";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import ExerciseGif from "@/components/ExerciseGif";

interface ExerciseScreenProps {
  navigation: any;
  route: any;
}

export default function ExerciseScreen({ navigation, route }: ExerciseScreenProps) {
  const exercise = route.params?.exercise;

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const addSet = useWorkoutsStore((state) => state.addSet);

  const addToRoutine = () => {
    addSet(exercise.exerciseId, {});
    navigation.goBack();
  };

  const targetMuscle = exercise.targetMuscles && exercise.targetMuscles.length > 0 ? exercise.targetMuscles[0] : "";

  const exerciseKey = exercise?.name?.toLowerCase() ?? "";
  const translatedExercise = t(`exercises.${exerciseKey}`, {
    returnObjects: true,
    defaultValue: {},
  }) as ExerciseTranslations;
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
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      <TouchableOpacity onPress={addToRoutine} className="bg-red-400 m-3 p-3 rounded-lg">
        <Text className="text-white text-center font-bold">Agregar a la rutina</Text>
      </TouchableOpacity>

      {/* Exercise Info */}
      <View className="mb-7 flex-row px-3 w-full items-center gap-4 py-4">
        {/* GIF */}
        <ExerciseGif exerciseId={exercise.exerciseId} className="size-24" />

        <View className="flex-row gap-4 flex-1">
          <View className="flex-[1.25]">
            <Text className="mb-0.5 text-sm font-semibold text-neutral-600">Musculos afectados</Text>

            <Text>
              {/* Target Muscle */}
              <Text className="text-xs font-medium text-red-400">{capitalize(targetMuscle)},</Text>
              {/* Secondary Muscles */}
              <Text className="text-neutral-400 text-xs">
                {exercise.secondaryMuscles &&
                  exercise.secondaryMuscles.length > 0 &&
                  " " + exercise.secondaryMuscles.map((muscle: string) => capitalize(muscle)).join(", ")}
              </Text>
            </Text>
          </View>

          {/* Equipment */}
          <View className="flex-1">
            <Text className="mb-0.5 text-sm font-semibold text-neutral-600">{t("screens.exercise.equipment")}</Text>
            <Text className="text-xs text-neutral-400">
              {exercise.equipments && exercise.equipments.length > 0
                ? capitalize(exercise.equipments.join(", "))
                : t("screens.exercise.none")}
            </Text>
          </View>
        </View>
      </View>

      <Instructions>{instructions}</Instructions>
    </ScrollView>
  );
}
