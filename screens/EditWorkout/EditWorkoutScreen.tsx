import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import colors from "tailwindcss/colors";
import Steps from "./components/Steps";
import { SelectWorkoutModal } from "@/components/modals/SelectWorkoutModal";
import { useModalStore } from "@/stores/useModalStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { randomId } from "@/utils/random";

export default function EditWorkoutScreen({ navigation, route }: any) {
  const { workoutId } = route.params;

  const insets = useSafeAreaInsets();

  const workouts = useWorkoutsStore((state) => state.workouts);
  const updateWorkoutName = useWorkoutsStore((state) => state.updateWorkoutName);
  const updateWorkoutSteps = useWorkoutsStore((state) => state.updateWorkoutSteps);
  const addRest = useWorkoutsStore((state) => state.addRest);
  const setEditingWorkoutId = useWorkoutsStore((state) => state.setEditingWorkoutId);
  const showModal = useModalStore((s) => s.showModal);

  const { weightUnit, advancedMode, toggleWeightUnit, toggleAdvancedMode } = useGlobalSettingsStore();

  const routines = useRoutinesStore((s) => s.routines);
  const workout = workouts.find((r) => r.id === workoutId);
  const routinesUsingWorkout = routines.filter((r) => r.days.some((d) => d.workoutId === workoutId));
  const isUsedInMultipleRoutines = routinesUsingWorkout.length > 1;

  useEffect(() => {
    setEditingWorkoutId(workoutId);
    return () => setEditingWorkoutId(null);
  }, [workoutId]);

  useEffect(() => {
    navigation.setOptions({
      title: "Editar entrenamiento",
    });
  }, [navigation]);

  const handleImportWorkout = () => {
    showModal({
      snapPoints: ["60%", "90%"],
      content: (
        <SelectWorkoutModal
          excludeId={workoutId}
          templateOnly={true}
          onSelectWorkout={(selectedWorkout, asTemplate) => {
            const newSteps = selectedWorkout.steps.map((step) => ({
              ...step,
              id: randomId(),
            }));
            updateWorkoutSteps(workoutId, newSteps);
          }}
        />
      ),
    });
  };

  if (!workout) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScrollView className="flex-1">
        {isUsedInMultipleRoutines && (
          <View className="bg-yellow-100 p-4 border-b border-yellow-200">
            <Text className="text-yellow-800 font-medium">
              Este entreno está siendo usado en otras rutinas. Si lo modificas, se modificará en todas. Ten cuidado.
            </Text>
          </View>
        )}
        <TextInput
          value={workout.name}
          onChangeText={updateWorkoutName}
          className="text-2xl p-6 font-bold"
          placeholder="Nombre del entrenamiento"
          cursorColor={colors.neutral[400]}
        />
        <View className="px-6 pb-4">
          <Text className="text-neutral-400 text-xs">
            {routinesUsingWorkout.length > 0
              ? `Este entreno se usa en: ${routinesUsingWorkout.map((r) => r.name || "Sin nombre").join(", ")}`
              : "Este entreno no se usa en ninguna rutina"}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 px-3">
          <TouchableOpacity
            onPress={handleImportWorkout}
            className="flex-row items-center px-3 py-1.5 rounded-full border border-neutral-200"
          >
            <Ionicons name="download-outline" size={16} color={colors.neutral[400]} />
            <Text className="text-xs font-semibold text-neutral-400 ml-1.5">USAR EXISTENTE COMO PLANTILLA</Text>
          </TouchableOpacity>

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
          <Steps steps={workout.steps} />

          <View className="flex-row items-center gap-2 mt-3">
            <TouchableOpacity
              onPress={() => navigation.navigate("exercises")}
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
