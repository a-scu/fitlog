import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";

import colors from "tailwindcss/colors";
import Steps from "./components/Steps";

export default function EditRoutineScreen({ navigation, route }: any) {
  const { routineId } = route.params;

  const insets = useSafeAreaInsets();

  const routines = useRoutinesStore((state) => state.routines);
  const updateRoutineName = useRoutinesStore((state) => state.updateRoutineName);
  const addRest = useRoutinesStore((state) => state.addRest);
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
      <ScrollView className="flex-1">
        <TextInput
          value={routine.name}
          onChangeText={updateRoutineName}
          className="text-2xl p-6 font-bold"
          placeholder="Nombre de la rutina"
          cursorColor={colors.neutral[400]}
        />

        <View className="flex-row items-center gap-1.5 px-3">
          <TouchableOpacity
            onPress={toggleAdvancedMode}
            className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${advancedMode ? "bg-neutral-100 border-neutral-300" : "border-neutral-200"}`}
          >
            <Ionicons
              name={"options-outline"}
              size={16}
              color={advancedMode ? colors.neutral[500] : colors.neutral[400]}
            />
            <Text className={`text-xs font-semibold ${advancedMode ? "text-neutral-500" : "text-neutral-400"}`}>
              MODO AVANZADO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleWeightUnit}
            className="flex-row items-center px-3 py-1.5 rounded-full border border-neutral-200"
          >
            <Ionicons name="scale-outline" size={16} color={colors.neutral[400]} />
            <Text className="text-xs font-semibold text-neutral-400 ml-1.5 mr-0.5">{weightUnit.toUpperCase()}</Text>
            <Ionicons name="repeat-outline" className="!text-neutral-400 text-xs leading-none" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-3">
          {/* Steps */}
          <Steps steps={routine.steps} />

          <View className="flex-row items-center gap-2 mt-3">
            <TouchableOpacity
              onPress={() => navigation.navigate("exercises", { routineId })}
              className="flex-1 p-3 bg-neutral-800 border border-neutral-800 rounded-md"
            >
              <Text className="text-center text-white font-medium">Agregar Ejercicios</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={addRest} className="flex-1 p-3 border-neutral-400 border rounded-md">
              <Text className="text-center font-medium text-neutral-800">Agregar Descanso</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
