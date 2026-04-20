import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect } from "react";
import { randomId } from "@/utils/random";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalRoutinesSettings } from "@/stores/GlobalRoutinesSettings";
import EXERCISES from "@/assets/data/exercises.json";
import { capitalize } from "@/lib/utils";
import { SET_TYPES } from "../ExerciseScreen/components/Series/SetTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

export default function Routine({ navigation, route }) {
  const { routineId } = route.params;

  const insets = useSafeAreaInsets();

  const routines = useRoutinesStore((state) => state.routines);
  const setRoutines = useRoutinesStore((state) => state.setRoutines);
  const weightUnit = useGlobalRoutinesSettings((state) => state.weightUnit);

  const routine = routines.find((r) => r.id === routineId);

  const deleteRoutine = () => {
    const filteredRoutines = routines.filter((r) => r.id !== routineId);
    setRoutines(filteredRoutines);
    navigation.goBack();
  };

  const updateRoutineName = (text: string) => {
    setRoutines(routines.map((r) => (r.id === routineId ? { ...r, name: text } : r)));
  };

  const updateRestDuration = (id: string, duration: number) => {
    setRoutines(
      routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              steps: r.steps.map((s) => (s.id === id && s.type === "rest" ? { ...s, duration } : s)),
            }
          : r,
      ),
    );
  };

  const deleteStep = (id: string) => {
    setRoutines(routines.map((r) => (r.id === routineId ? { ...r, steps: r.steps.filter((s) => s.id !== id) } : r)));
  };

  const editExercise = (index: number, exerciseId: string) => {
    // Find contiguous range
    let startIndex = index;
    while (
      startIndex > 0 &&
      routine.steps[startIndex - 1].type !== "rest" &&
      routine.steps[startIndex - 1].exerciseId === exerciseId
    ) {
      startIndex--;
    }
    let endIndex = index;
    while (
      endIndex < routine.steps.length - 1 &&
      routine.steps[endIndex + 1].type !== "rest" &&
      routine.steps[endIndex + 1].exerciseId === exerciseId
    ) {
      endIndex++;
    }

    const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);
    navigation.navigate("exercise", { routineId, exercise, editMode: true, startIndex, endIndex });
  };

  const addRest = () => {
    const newRest: any = { id: randomId(), type: "rest", duration: 60 };
    setRoutines(routines.map((r) => (r.id === routineId ? { ...r, steps: [...r.steps, newRest] } : r)));
  };

  useEffect(() => {
    navigation.setOptions({
      title: "Editar Rutina",
    });
  }, [routine?.name]);

  if (!routine) return null;

  return (
    <View className="flex-1 flex-grow bg-white" style={{ paddingBottom: insets.bottom }}>
      <View className="px-3 pt-3">
        <TextInput
          value={routine.name}
          onChangeText={updateRoutineName}
          className="text-2xl font-bold"
          placeholder="Nombre de la rutina"
        />
      </View>

      <View className="gap-2 p-3">
        {routine.steps.map((step, index) => {
          const isSet = step.type !== "rest" ? true : false;

          if (isSet) {
            const exercise = EXERCISES.find((e) => e.exerciseId === step.exerciseId);

            const setType = SET_TYPES.find((s) => s.id === step.type);

            return (
              <TouchableOpacity
                onPress={() => editExercise(index, step.exerciseId)}
                className="bg-neutral-200 rounded p-3"
                activeOpacity={0.7}
              >
                <View className="flex-row gap-1 mb-2">
                  {/* Gif */}
                  <View className="rounded-md size-12 items-center overflow-hidden">
                    <Image source={{ uri: exercise?.gifUrl }} style={{ width: "100%", height: "100%" }} />
                  </View>

                  <View className="justify-center">
                    <View className="flex-row gap-2 items-center">
                      {/* Set Type */}
                      <Text className="font-medium text-neutral-600">Serie {index + 1}</Text>

                      {/* Label */}
                      <Text className={`py-px text-xs px-1.5 self-start rounded ${setType?.selectedColor}`}>
                        {setType.label}
                      </Text>
                    </View>

                    <Text className="text-lg font-semibold">{capitalize(exercise?.name)}</Text>
                  </View>
                </View>

                {/* Main metrics */}
                <View className="flex-row gap-1 w-full mb-2">
                  <View className="bg-neutral-400 rounded p-2 flex-1">
                    <Text className="text-center text-sm font-medium">
                      {step.weight || "-"} {weightUnit}
                    </Text>
                  </View>

                  <View className="bg-neutral-400 rounded p-2 flex-1">
                    <Text className="text-center text-sm font-medium">{step.reps ? `${step.reps} Reps` : "-"}</Text>
                  </View>

                  <View className="bg-neutral-400 rounded p-2 flex-1">
                    <Text className="text-center text-sm font-medium">RIR {step.rir || "-"}</Text>
                  </View>
                </View>

                {/* Partial reps */}
                {step.partialReps && (
                  <View className="flex-row gap-2 mb-2 border p-2 border-neutral-400 rounded">
                    {step.partialReps.count ? (
                      <Text>Partial reps: {step.partialReps.count == 10 ? "Fallo" : step.partialReps.count}</Text>
                    ) : (
                      <View className="flex-row items-center">
                        <Text>Partial reps: {step.partialReps.min} -</Text>
                        <Text> {step.partialReps.max == 10 ? "Fallo" : step.partialReps.max}</Text>
                      </View>
                    )}

                    {step.partialReps.rom && <Text>ROM: {step.partialReps.rom}</Text>}
                  </View>
                )}

                {/* Drop sets */}
                {step.dropSets?.length > 0 && (
                  <View className="gap-1">
                    {step.dropSets?.map((dropSet, dropsetIndex) => (
                      <View key={dropSet.id} className="w-full">
                        <View className="flex-row w-full items-center gap-2">
                          <Ionicons name="return-down-forward-outline" size={16} />

                          <View className="bg-neutral-300 gap-1 rounded flex-1 p-2">
                            <Text className="text-sm">Dropset {dropsetIndex + 1}</Text>

                            <View className="flex-row gap-1">
                              <View className="bg-neutral-400 rounded p-2 flex-1">
                                <Text className="text-center text-sm font-medium">
                                  {dropSet.weight || "-"} {weightUnit}
                                </Text>
                              </View>

                              <View className="bg-neutral-400 rounded p-2 flex-1">
                                <Text className="text-center text-sm font-medium">
                                  {dropSet.reps ? `${dropSet.reps} Reps` : "-"}
                                </Text>
                              </View>

                              <View className="bg-neutral-400 rounded p-2 flex-1">
                                <Text className="text-center text-sm font-medium">RIR {dropSet.rir || "-"}</Text>
                              </View>
                            </View>

                            {/* Partial Reps */}
                            <View className="flex-row gap-2 border p-2 border-neutral-400 rounded">
                              {dropSet.partialReps.count ? (
                                <Text>
                                  Partial reps: {dropSet.partialReps.count == 10 ? "Fallo" : dropSet.partialReps.count}
                                </Text>
                              ) : (
                                <View className="flex-row items-center">
                                  <Text>Partial reps: {dropSet.partialReps.min} -</Text>
                                  <Text> {dropSet.partialReps.max == 10 ? "Fallo" : dropSet.partialReps.max}</Text>
                                </View>
                              )}

                              {dropSet.partialReps.rom && <Text>ROM: {dropSet.partialReps.rom}</Text>}
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}

                    {/* Notes */}
                    {step.notes?.enabled && (
                      <View className="gap-1 bg-neutral-300 p-2 rounded">
                        <View className="flex-row gap-1 items-center">
                          <Ionicons name="chatbox-outline" size={10} className="!text-neutral-500" />
                          <Text className="text-neutral-500 text-sm font-medium">Notas</Text>
                        </View>

                        <Text>{step.notes.text || "Lorem ipsum dolor sit amet et..."}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <View key={step.id} className="flex-row items-center justify-between p-3 bg-neutral-200 rounded">
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
        })}
      </View>

      <View className="flex-row items-center gap-2 px-3 mb-3">
        <TouchableOpacity
          onPress={() => navigation.navigate("exercises", { routineId })}
          className="flex-1 p-3 bg-neutral-800 rounded-lg"
        >
          <Text className="text-center text-white font-medium">Agregar Ejercicio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={addRest} className="flex-1 p-3 border-neutral-300 border rounded-lg">
          <Text className="text-center font-medium">Agregar Descanso</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-1 px-3">
        <TouchableOpacity onPress={deleteRoutine} className="flex-1 p-3 border-red-400 border rounded-lg">
          <Text className="text-center text-red-500 font-medium">Eliminar rutina</Text>
        </TouchableOpacity>
      </View>

      <View className="px-3 pb-3 mt-auto">
        <TouchableOpacity className="p-3 bg-red-400 rounded-lg">
          <Text className="text-center text-white font-bold">Iniciar rutina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
