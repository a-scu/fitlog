import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { useEffect } from "react";
import { isSameDay, startOfDay } from "date-fns";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import EXERCISES from "@/assets/data/exercises.json";
import { capitalize } from "@/utils/text";
import RegisterSetModal from "@/components/modals/RegisterSetModal";
import { useModalStore } from "@/stores/ModalStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useTheme } from "@/stores/ThemeStore";
import { SET_TYPES } from "@/constants/SetTypes";
import { Workout } from "@/types/Workout";

const today = startOfDay(new Date()).toISOString();

export default function WorkoutSessionScreen({ route, navigation }: any) {
  const { date } = route.params || { date: today };

  const insets = useSafeAreaInsets();

  const { isDark } = useTheme();
  const showModal = useModalStore((s) => s.showModal);
  const workouts = useWorkoutsStore((s) => s.workouts);

  const pauseWorkout = useActiveWorkoutStore((s) => s.pauseWorkout);
  const resumeWorkout = useActiveWorkoutStore((s) => s.resumeWorkout);
  const activeWorkoutId = useActiveWorkoutStore((s) => s.activeWorkoutId);
  const isPaused = useActiveWorkoutStore((s) => s.isPaused);
  const finishWorkout = useActiveWorkoutStore((s) => s.finishWorkout);
  const updateInteractionTime = useActiveWorkoutStore((s) => s.updateInteractionTime);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date));
  const updateWorkoutSessionField = useWorkoutsHistoryStore((s) => s.updateWorkoutSessionField);
  const removeSet = useWorkoutsHistoryStore((s) => s.removeSet);

  const workout = workouts.find((w) => w.id === activeWorkoutId) || {
    steps: [],
    name: "Entreno Libre",
  };

  const isFreeWorkout = activeWorkoutId === "free";
  const plannedSteps = workout?.steps || [];
  const extraSets = workoutSession?.sets.filter((s) => !plannedSteps.some((step) => step.id === s.id)) || [];

  const handleSelectExercises = () => {
    navigation.navigate("exercises", { workoutSessionDate: date });
  };

  const handleFinishWorkout = () => {
    useWorkoutsHistoryStore.getState().updateWorkoutSessionField(date, "isCompleted", true);
    finishWorkout();
    navigation.replace("workoutSessionSummary", { workoutSessionDate: date });
  };

  const handleMarkAsCompleted = () => {
    updateWorkoutSessionField(date, "isCompleted", true);
    navigation.goBack();
  };

  const handleMinimize = () => {
    navigation.goBack();
  };

  const handlePause = () => {
    if (isPaused) resumeWorkout();
    else pauseWorkout();
  };

  const openRegisterModal = (setId: string, exerciseId: string, plannedSet?: any) => {
    showModal({
      withBottomSheetView: false,
      content: <RegisterSetModal date={date} setId={setId} exerciseId={exerciseId} plannedSet={plannedSet} />,
    });
  };

  const handleRemoveAllSets = () => {
    Alert.alert("Eliminar registros", "Se eliminarán todos tus registros de este entreno. ¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          updateWorkoutSessionField(date, "isCompleted", false);
          updateWorkoutSessionField(date, "sets", []);
          navigation.navigate("workoutSession", { date: new Date() });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-neutral-950"
      style={{
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView contentContainerClassName="gap-3 p-3 grow">
        {workoutSession?.sets.length ? (
          <View>
            <Text className="text-white">Registros:</Text>

            {workoutSession?.sets.map((set, index) => {
              const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

              if (!exercise)
                return (
                  <Text className="p-4 text-center dark:text-white" key={set.id}>
                    No se encontró el ejercicio
                  </Text>
                );

              const { weight, reps, rir, dropSets } = set as any;
              const setTypeObj = SET_TYPES.find((t) => t.id === set.type);

              return (
                <TouchableOpacity
                  key={set.id}
                  activeOpacity={0.85}
                  onPress={() => openRegisterModal(set.id, set.exerciseId)}
                  className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/10 dark:bg-neutral-950/10 gap-3"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-neutral-700 dark:text-neutral-300 font-bold text-sm">Set {index + 1}</Text>
                      {setTypeObj && set.type !== "effective" && (
                        <View
                          style={{
                            backgroundColor: setTypeObj.color[500] + "15",
                          }}
                          className="px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/20"
                        >
                          <Text style={{ color: setTypeObj.color[500] }} className="text-[10px] font-bold uppercase tracking-wider">
                            {setTypeObj.label}
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity onPress={() => removeSet(date, set.id)} className="p-1" activeOpacity={0.7}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text className="text-base font-bold text-neutral-800 dark:text-neutral-100">{capitalize(exercise.name)}</Text>
                  </View>

                  {/* Metrics Table Grid */}
                  <View className="flex-row gap-3 bg-neutral-50/50 dark:bg-neutral-950/30 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/40 justify-between">
                    <View className="items-center flex-1">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Peso</Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {weight !== undefined && weight !== null && weight !== "" ? `${weight} kg` : "—"}
                      </Text>
                    </View>

                    <View className="items-center flex-1 border-x border-neutral-200/50 dark:border-neutral-800/50">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Reps</Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {reps !== undefined && reps !== null && reps !== "" ? reps : "—"}
                      </Text>
                    </View>

                    <View className="items-center flex-1">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">RIR</Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {rir !== undefined && rir !== null && rir !== "" ? `RIR ${rir}` : "—"}
                      </Text>
                    </View>
                  </View>

                  {/* DropSets Rendering */}
                  {dropSets && dropSets.length > 0 && (
                    <View className="gap-2 mt-1">
                      {dropSets.map((dropSet: any, dropIndex: number) => {
                        return (
                          <View
                            key={dropSet.id}
                            className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-950/30 items-center justify-between"
                          >
                            <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">Dropset {dropIndex + 1}</Text>
                            <Text className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">
                              {dropSet.weight ? `${dropSet.weight} kg` : "—"} × {dropSet.reps ? dropSet.reps : "—"}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View>
            <Text className="text-white">No hay registros</Text>
          </View>
        )}

        {workoutSession?.isCompleted && (
          <TouchableOpacity
            onPress={handleRemoveAllSets}
            activeOpacity={0.8}
            className="p-4 bg-red-950/25 border-1.5 border-red-950 rounded-xl items-center flex-row justify-center gap-1.5"
          >
            <Ionicons name="close-outline" size={16} color={colors.red[500]} />
            <Text className="text-red-500 font-semibold text-lg">Eliminar sesion</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View className="mt-4 gap-3 flex-row w-full p-3">
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("exercises", { workoutSessionDate: date });
          }}
          activeOpacity={0.7}
          className="border-1.5 flex-1 border-blue-600 bg-blue-600 p-4 rounded-xl items-center justify-center flex-row gap-2"
        >
          {/* <Ionicons name="add" size={20} color={colors.neutral[500]} /> */}
          <Text className="text-white font-semibold text-lg">Agregar ejercicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMarkAsCompleted}
          activeOpacity={0.7}
          className="border-1.5 flex-1 border-green-600 bg-green-600 p-4 rounded-xl items-center justify-center flex-row gap-2"
        >
          {/* <Ionicons name="add" size={20} color={colors.neutral[500]} /> */}
          <Text className="text-white font-semibold text-lg">Completar entrenamiento</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
