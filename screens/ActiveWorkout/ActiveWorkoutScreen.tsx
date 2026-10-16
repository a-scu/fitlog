import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { useEffect } from "react";
import { startOfDay } from "date-fns";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import EXERCISES from "@/assets/data/exercises.json";
import { capitalize } from "@/utils/text";
import RegisterSetModal from "@/components/modals/RegisterSetModal";
import { useModalStore } from "@/stores/ModalStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { SET_TYPES } from "@/constants/SetTypes";
import { Workout } from "@/types/Workout";
import PlannedSteps from "./components/PlannedSteps";

const today = startOfDay(new Date()).toISOString();

export default function ActiveWorkoutScreen({ route, navigation }: any) {
  const date = today;

  const insets = useSafeAreaInsets();

  const showModal = useModalStore((s) => s.showModal);
  const workouts = useWorkoutsStore((s) => s.workouts);

  const pauseWorkout = useActiveWorkoutStore((s) => s.pauseWorkout);
  const resumeWorkout = useActiveWorkoutStore((s) => s.resumeWorkout);
  const activeWorkoutId = useActiveWorkoutStore((s) => s.activeWorkoutId);
  const isPaused = useActiveWorkoutStore((s) => s.isPaused);
  const finishWorkout = useActiveWorkoutStore((s) => s.finishWorkout);
  const updateInteractionTime = useActiveWorkoutStore((s) => s.updateInteractionTime);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date));
  const updateWorkoutSession = useWorkoutsHistoryStore((s) => s.updateWorkoutSession);
  const updateWorkoutSessionField = useWorkoutsHistoryStore((s) => s.updateWorkoutSessionField);

  const workout = workouts.find((w) => w.id === activeWorkoutId) || {
    steps: [],
    name: "Entreno libre",
  };

  const plannedSteps = workout?.steps || [];
  const extraSets = workoutSession?.sets.filter((s) => !plannedSteps.some((step) => step.id === s.id)) || [];

  useEffect(() => {
    navigation.setOptions({ title: workout?.name || "Entreno Libre" });
    updateInteractionTime();
  }, []);

  const handleSelectExercises = () => {
    navigation.navigate("exercises", { workoutSessionDate: date });
  };

  const handleFinishWorkout = () => {
    updateWorkoutSessionField(date, "isCompleted", true);
    finishWorkout();
    navigation.replace("workoutSessionSummary", { workoutSessionDate: date });
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

  const handleDiscardWorkout = () => {
    const discardWorkout = () => {
      updateWorkoutSession(date, { ...workoutSession, sets: [], isCompleted: false, duration: 0 });
      finishWorkout();
      navigation.goBack();
    };

    Alert.alert("Descartar entreno", "¿Estás seguro? Los registros se eliminaran y se terminara el entreno", [
      { text: "Cancelar", style: "cancel" },
      { text: "Descartar", onPress: discardWorkout, style: "destructive" },
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
        <View className="self-end flex-row gap-1.5 items-center">
          {/* Agregar ejercicio */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("exercises", { workoutSessionDate: date });
            }}
            activeOpacity={0.7}
            className="p-3 pr-2 rounded-xl flex-row gap-1 items-center justify-center border-1.5 bg-blue-950/25 border-blue-900"
          >
            <Text className="text-blue-500 font-semibold uppercase text-[10px]">Agregar ejercicio</Text>
            <Ionicons name={"add-circle-outline"} size={14} color={colors.blue[500]} />
          </TouchableOpacity>

          {/* Descartar entreno */}
          <TouchableOpacity
            onPress={handleDiscardWorkout}
            activeOpacity={0.7}
            className="p-3 pr-2 rounded-xl flex-row gap-1 items-center justify-center border-1.5 bg-red-950/25 border-red-900"
          >
            <Text className="text-red-500 font-semibold uppercase text-[10px]">Descartar entreno</Text>
            <Ionicons name={"remove-circle-outline"} size={14} color={colors.red[500]} />
          </TouchableOpacity>
        </View>

        <Steps plannedSteps={plannedSteps} extraSets={extraSets} openRegisterModal={openRegisterModal} />
      </ScrollView>

      <View className="mt-4 gap-3 flex-row w-full p-3">
        {/* Completar */}
        <TouchableOpacity
          onPress={handleFinishWorkout}
          activeOpacity={0.7}
          className="flex-1 bg-green-950/25 border-green-900 border-1.5 h-16 rounded-xl items-center justify-center"
        >
          <Text className="text-green-500 font-bold uppercase">Completar entreno</Text>
        </TouchableOpacity>

        {/* Pause/Play */}
        <TouchableOpacity
          onPress={handlePause}
          activeOpacity={0.7}
          className="rounded-xl aspect-square h-16 items-center justify-center border-1.5 bg-blue-950/25 border-blue-900"
        >
          <Ionicons name={isPaused ? "play-outline" : "pause-outline"} size={20} color={colors.blue[500]} />
        </TouchableOpacity>

        {/* Siguiente step */}
        <TouchableOpacity
          onPress={() => {}}
          activeOpacity={0.7}
          className="rounded-xl aspect-square h-16 items-center justify-center border-1.5 bg-blue-950/25 border-blue-900"
        >
          {/* <Text className="text-blue-500 font-bold text-sm uppercase">Siguiente</Text> */}
          <Ionicons name={"play-skip-forward-outline"} size={20} color={colors.blue[500]} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const Steps = ({ plannedSteps, extraSets, openRegisterModal }: { plannedSteps: Workout["steps"]; extraSets: any[]; openRegisterModal: any }) => {
  const date = new Date().toISOString();

  const updateInteractionTime = useActiveWorkoutStore((s) => s.updateInteractionTime);
  const removeSet = useWorkoutsHistoryStore((s) => s.removeSet);
  const toggleSetCompleted = useWorkoutsHistoryStore((s) => s.toggleSetCompleted);

  return (
    <View className="gap-3">
      <PlannedSteps plannedSteps={plannedSteps} />

      {extraSets.length > 0 && (
        <View>
          {extraSets.map((set, extraIndex) => {
            const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

            if (!exercise)
              return (
                <Text className="p-4 text-center dark:text-white" key={set.id}>
                  No se encontró el ejercicio
                </Text>
              );

            const { weight, reps, rir, dropSets, completed } = set as any;
            const setNumber = plannedSteps.length + extraIndex + 1;
            const setTypeObj = SET_TYPES.find((t) => t.id === set.type);

            return (
              <TouchableOpacity
                key={set.id}
                activeOpacity={0.85}
                onPress={() => openRegisterModal(set.id, set.exerciseId)}
                className={`p-4 border rounded-2xl gap-3 transition-colors ${
                  completed
                    ? "border-emerald-500/40 dark:border-emerald-600/30 bg-emerald-50/25 dark:bg-emerald-950/10"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/10 dark:bg-neutral-950/10"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity onPress={() => removeSet(date, set.id)} className="p-1" activeOpacity={0.7}>
                      <Ionicons name="remove-circle-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        toggleSetCompleted(date, set.id, set.exerciseId);
                        updateInteractionTime();
                      }}
                      activeOpacity={0.7}
                      className={`w-7 h-7 rounded-full items-center justify-center border ${
                        completed ? "bg-emerald-500 border-emerald-500" : "border-neutral-300 dark:border-neutral-600 bg-transparent"
                      }`}
                    >
                      {completed && <Ionicons name="checkmark" size={16} color="white" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row gap-2 items-center">
                  <Text className="text-base font-bold text-neutral-800 dark:text-neutral-100">{capitalize(exercise.name)}</Text>

                  {setTypeObj && set.type !== "effective" && (
                    <View
                      style={{
                        backgroundColor: setTypeObj.color[500] + "15",
                      }}
                      className="px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/25"
                    >
                      <Text style={{ color: setTypeObj.color[500] }} className="text-[10px] font-bold uppercase tracking-wider">
                        {setTypeObj.label}
                      </Text>
                    </View>
                  )}
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
                          className="flex-row border border-indigo-500/25 dark:border-indigo-600/15 rounded-xl p-3 bg-indigo-50/5 dark:bg-indigo-950/5 items-center justify-between"
                        >
                          <View className="flex-row items-center gap-1.5">
                            <Ionicons name="add-circle-outline" size={14} color="#6366f1" />
                            <Text className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Dropset {dropIndex + 1} (Extra)</Text>
                          </View>
                          <Text className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
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
      )}
    </View>
  );
};
