import { capitalize } from "@/lib/utils";
import { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { randomId } from "@/utils/random";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";

import Instructions from "./components/Instructions";
import { ExerciseTranslations, Routine, Set } from "./types";
import SetItem from "./components/Series/SetItem";
import HeaderInfo from "./components/HeaderInfo";
import { useGlobalRoutinesSettings } from "@/stores/GlobalRoutinesSettings";
import { useModalStore } from "@/stores/useModalStore";
import PartialRepsModal from "./modals/PartialRepsModal";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useRoutineDraftStore } from "@/stores/RoutineDraftStore";
import { TextInput } from "react-native";

interface ExerciseScreenProps {
  navigation: any;
  route: any;
}

export default function ExerciseScreen({ navigation, route }: ExerciseScreenProps) {
  const exercise = route.params?.exercise;
  const routineId = route.params?.routineId;

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const showModal = useModalStore((state) => state.showModal);

  const setRoutines = useRoutinesStore((state) => state.setRoutines);
  const routines = useRoutinesStore((state) => state.routines);

  const weightUnit = useGlobalRoutinesSettings((state) => state.weightUnit);
  const advancedMode = useGlobalRoutinesSettings((state) => state.advancedMode);
  const toggleWeightUnit = useGlobalRoutinesSettings((state) => state.toggleWeightUnit);
  const toggleAdvancedMode = useGlobalRoutinesSettings((state) => state.toggleAdvancedMode);

  const steps = useRoutineDraftStore((state) => state.steps);
  const setSteps = useRoutineDraftStore((state) => state.setSteps);
  const clearDraft = useRoutineDraftStore((state) => state.clearDraft);
  const addSet = useRoutineDraftStore((state) => state.addSet);
  const addRest = useRoutineDraftStore((state) => state.addRest);
  const updateRestDuration = useRoutineDraftStore((state) => state.updateRestDuration);
  const deleteStep = useRoutineDraftStore((state) => state.deleteStep);

  useEffect(() => {
    if (route.params.editMode && route.params.startIndex !== undefined) {
      const routine = useRoutinesStore.getState().routines.find((r: any) => r.id === routineId);
      if (routine) {
        const editableSteps = routine.steps.slice(route.params.startIndex, route.params.endIndex + 1);
        setSteps(editableSteps);
      }
    } else if (steps.length === 0 && exercise) {
      setSteps([
        {
          id: randomId(),
          weight: "",
          reps: "",
          rir: "",
          exerciseId: exercise.exerciseId,
          type: "effective",
          weightIsRange: false,
          repsIsRange: false,
          rirIsRange: false,
          dropSets: [],
          partialReps: {
            count: "",
            rom: "",
            customRom: "",
          },
          notes: { enabled: false, text: "" },
        },
      ]);
    }
    
    return () => {
      clearDraft();
    };
  }, [exercise, route.params.editMode]);

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

  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      Keyboard.dismiss();
    });

    return () => {
      hideSubscription.remove();
    };
  }, []);

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t("screens.exercise.notFound")}</Text>
      </View>
    );
  }

  const addToRoutine = () => {
    const isNewRoutine = !routines.some((r) => r.id === routineId);

    if (isNewRoutine) {
      const newRoutine: Routine = {
        id: routineId,
        name: "New Routine",
        steps: [...steps],
      };
      setRoutines([newRoutine, ...routines]);
    } else {
      const updatedRoutines = routines.map((r) => {
        if (r.id === routineId) {
          if (route.params.editMode && route.params.startIndex !== undefined) {
             const newSteps = [...r.steps];
             newSteps.splice(route.params.startIndex, route.params.endIndex - route.params.startIndex + 1, ...steps);
             return { ...r, steps: newSteps };
          } else {
             return { ...r, steps: [...r.steps, ...steps] };
          }
        }
        return r;
      });
      setRoutines(updatedRoutines);
    }
    clearDraft();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Content */}
        <View className="pb-3">
          <TouchableOpacity onPress={addToRoutine} className="bg-red-400 m-3 p-3 rounded-lg">
            <Text className="text-white text-center font-bold">
              {route.params.editMode ? "Guardar cambios" : "Agregar a la rutina"}
            </Text>
          </TouchableOpacity>
          {/* Header Info */}
          <HeaderInfo exercise={exercise} />

          {/* Series List */}
          <View className="mb-5">
            <View className="mb-3 px-3 items-center flex-1 flex-row">
              <Text className="text-lg font-bold text-neutral-800">Series</Text>
            </View>

            {/* Series Config */}

            <View className="gap-4 flex-row items-center justify-end pr-3">
              {/* Toggle Peso */}

              <TouchableOpacity onPress={toggleWeightUnit} className="flex-row items-center justify-center gap-0.5">
                <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">
                  Peso ({weightUnit})
                </Text>
                <Ionicons name="repeat" size={12} className="!text-neutral-400" />
              </TouchableOpacity>

              {/* Toggle Modo Avanzado */}

              <TouchableOpacity onPress={toggleAdvancedMode} className="flex-row items-center justify-center gap-0.5">
                <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">Modo Avanzado</Text>

                <Ionicons name={advancedMode ? "checkbox" : "square-outline"} size={12} className="!text-neutral-400" />
              </TouchableOpacity>
            </View>

            {/* Sets List */}

            <View className="border-t border-neutral-100 gap-6 p-3">
              {steps.map((step, index) => {


                const set = step as Set;
                return <SetItem key={set.id} set={set} index={index} setsCount={steps.length} />;
              })}
            </View>

            

            <TouchableOpacity
              onPress={() => addSet(exercise.exerciseId, {})}
              className="mx-3 flex-row items-center justify-center gap-2 rounded-md h-16"
            >
              <Ionicons name="add" size={20} className="!text-neutral-900" />
              <Text className="font-semibold text-sm text-neutral-900">AGREGAR SERIE</Text>
            </TouchableOpacity>
          </View>

          <Instructions>{instructions}</Instructions>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
