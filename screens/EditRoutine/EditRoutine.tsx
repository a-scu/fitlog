import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import SetItem from "./components/Set";

import EXERCISES from "@/assets/data/exercises.json";

import { capitalize } from "@/lib/utils";

export default function EditRoutine({ navigation, route }: any) {
  const { routineId } = route.params;

  const insets = useSafeAreaInsets();

  const routines = useRoutinesStore((state) => state.routines);
  const updateRoutineName = useRoutinesStore((state) => state.updateRoutineName);
  const addRest = useRoutinesStore((state) => state.addRest);
  const updateRestDuration = useRoutinesStore((state) => state.updateRestDuration);
  const deleteStep = useRoutinesStore((state) => state.deleteStep);
  const setEditingRoutineId = useRoutinesStore((state) => state.setEditingRoutineId);

  const { weightUnit, advancedMode, toggleWeightUnit, toggleAdvancedMode } = useGlobalSettingsStore();

  const routine = routines.find((r) => r.id === routineId);

  useEffect(() => {
    setEditingRoutineId(routineId);
    return () => setEditingRoutineId(null);
  }, [routineId]);

  useEffect(() => {
    navigation.setOptions({
      title: "Editando Rutina",
    });
  }, [navigation]);

  if (!routine) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="px-3 pt-3 flex-row items-center gap-2 border-b border-neutral-100 pb-2">
        <TextInput
          value={routine.name}
          onChangeText={updateRoutineName}
          className="text-2xl font-bold flex-1"
          placeholder="Nombre de la rutina"
        />
      </View>

      <View className="flex-row items-center gap-4 px-3 py-2 bg-neutral-50 border-b border-neutral-100">
        <TouchableOpacity
          onPress={toggleAdvancedMode}
          className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full ${advancedMode ? "bg-red-100" : "bg-neutral-200"}`}
        >
          <Ionicons name={"options-outline"} size={16} color={advancedMode ? "#ef4444" : "#737373"} />
          <Text className={`text-xs font-bold ${advancedMode ? "text-red-500" : "text-neutral-500"}`}>
            MODO AVANZADO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleWeightUnit}
          className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-200"
        >
          <Ionicons name="scale-outline" size={16} color="#737373" />
          <Text className="text-xs font-bold text-neutral-500">{weightUnit.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-3">
        {routine.steps.map((step: any, index: number) => {
          const prev = index > 0 ? routine.steps[index - 1] : null;
          const showHeader = step.type !== "rest" && (prev?.type === "rest" || prev?.exerciseId !== step.exerciseId);

          if (step.type === "rest") {
            return (
              <View key={step.id} className="flex-row items-center justify-between p-3 bg-neutral-100 rounded mb-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" size={20} className="!text-neutral-500" />
                  <Text className="text-neutral-600 font-medium">Descanso</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    className="bg-white px-3 py-1 rounded-md w-16 text-center font-bold"
                    keyboardType="numeric"
                    value={step.duration?.toString()}
                    onChangeText={(text) => updateRestDuration(step.id, parseInt(text) || 0)}
                  />
                  <Text className="text-neutral-500 text-sm">s</Text>
                  <TouchableOpacity onPress={() => deleteStep(step.id)} className="ml-2">
                    <Ionicons name="trash-outline" size={20} className="!text-red-400" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }

          const exercise = EXERCISES.find((e) => e.exerciseId === step.exerciseId);
          return (
            <View key={step.id} className="mb-2">
              {showHeader && (
                <Text className="text-lg font-bold text-neutral-800 mb-2 mt-2">{capitalize(exercise?.name)}</Text>
              )}
              <SetItem set={step} index={index} />
            </View>
          );
        })}

        <View className="flex-row items-center gap-2 mt-4 mb-10">
          <TouchableOpacity
            onPress={() => navigation.navigate("exercises", { routineId })}
            className="flex-1 p-3 bg-neutral-800 rounded-lg"
          >
            <Text className="text-center text-white font-medium">Agregar Ejercicios</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={addRest} className="flex-1 p-3 border-neutral-300 border rounded-lg">
            <Text className="text-center font-medium">Agregar Descanso</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
