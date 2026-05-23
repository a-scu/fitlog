import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
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

const today = startOfDay(new Date()).toISOString();

export default function WorkoutSessionScreen({ route, navigation }: any) {
  const { date } = route.params || { date: today };

  const insets = useSafeAreaInsets();
  const workouts = useWorkoutsStore((s) => s.workouts);
  const { isDark } = useTheme();

  const updateWorkoutSessionField = useWorkoutsHistoryStore(
    (s) => s.updateWorkoutSessionField,
  );

  const {
    activeWorkoutId,
    pauseWorkout,
    resumeWorkout,
    isPaused,
    finishWorkout: storeFinishWorkout,
    updateInteractionTime,
    freeWorkout,
  } = useActiveWorkoutStore((s) => s);

  const showModal = useModalStore((s) => s.showModal);

  const workout =
    freeWorkout || !activeWorkoutId
      ? { steps: [], name: "Entreno Libre" }
      : workouts.find((w) => w.id === activeWorkoutId);

  const workoutSessions = useWorkoutsHistoryStore((s) => s.workoutSessions);
  const workoutSession = workoutSessions.find((w) => isSameDay(w.date, date));
  const removeSet = useWorkoutsHistoryStore((s) => s.removeSet);

  const plannedSteps = workout?.steps || [];
  const extraSets =
    workoutSession?.sets.filter(
      (s) => !plannedSteps.some((step) => step.id === s.id),
    ) || [];

  const isActive = activeWorkoutId !== null && isSameDay(date, today);

  const handleRemoveAllSets = () => {
    Alert.alert(
      "Reiniciar Entreno",
      "Si reinicias el entreno de hoy, todos tus registros se resetearán. ¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: () => {
            updateWorkoutSessionField(date, "status", "in_progress");
            updateWorkoutSessionField(date, "sets", []);
            navigation.navigate("workoutSession", { date: new Date() });
          },
        },
      ],
    );
  };

  useEffect(() => {
    if (isActive) {
      updateInteractionTime();
    }
  }, [isActive]);

  const openRegisterModal = (
    setId: string,
    exerciseId: string,
    plannedSet?: any,
  ) => {
    showModal({
      withBottomSheetView: false,
      content: (
        <RegisterSetModal
          date={date}
          setId={setId}
          exerciseId={exerciseId}
          plannedSet={plannedSet}
        />
      ),
    });
  };

  const handleSelectExercises = () => {
    navigation.navigate("exercises", { workoutSessionDate: date });
  };

  const finishWorkout = () => {
    useWorkoutsHistoryStore
      .getState()
      .updateWorkoutSessionField(date, "status", "completed");
    storeFinishWorkout();
    navigation.replace("workoutSessionSummary", { workoutSessionDate: date });
  };

  const handleMarkAsCompleted = () => {
    updateWorkoutSessionField(date, "status", "completed");
    navigation.goBack();
  };

  const handleMinimize = () => {
    navigation.goBack();
  };

  const handlePause = () => {
    if (isPaused) resumeWorkout();
    else pauseWorkout();
  };

  if (isActive && !workout)
    return <Text className="p-4 text-center dark:text-white">Hubo un error con el entreno activo</Text>;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-neutral-900"
    >
      <ScrollView
        contentContainerClassName="gap-4 p-4 grow"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Dynamic Title / Header Area */}
        <View className="flex-row justify-between items-center mb-1">
          <View>
            <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
              Sesión de Entreno
            </Text>
            <Text className="text-neutral-900 dark:text-white text-2xl font-black mt-0.5">
              {workout?.name || "Entreno Libre"}
            </Text>
          </View>
          {isActive && (
            <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full flex-row items-center gap-1.5 border border-blue-200/50 dark:border-blue-800/30">
              <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                En Curso
              </Text>
            </View>
          )}
        </View>

        {/* NON-ACTIVE SCREEN ACTIONS */}
        {!isActive && (
          <View className="gap-2.5 mb-1">
            <TouchableOpacity
              onPress={handleSelectExercises}
              activeOpacity={0.8}
              className="w-full py-3.5 bg-green-500 dark:bg-green-600 rounded-2xl items-center flex-row justify-center gap-2 shadow-sm"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold text-base">
                Agregar ejercicio
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={handleRemoveAllSets}
                activeOpacity={0.8}
                className="flex-1 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl items-center flex-row justify-center gap-1.5"
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text className="text-red-500 dark:text-red-400 font-semibold text-sm">
                  Reiniciar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMarkAsCompleted}
                activeOpacity={0.8}
                className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl items-center flex-row justify-center gap-1.5 border border-neutral-200/50 dark:border-neutral-700/30"
              >
                <Ionicons name="checkmark-done-outline" size={16} color={isDark ? "#d4d4d4" : "#404040"} />
                <Text className="text-neutral-700 dark:text-neutral-300 font-semibold text-sm">
                  Completar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ACTIVE SCREEN ACTIONS */}
        {isActive && (
          <View className="flex-row gap-2.5 mb-1">
            <TouchableOpacity
              onPress={handleMinimize}
              activeOpacity={0.8}
              className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl items-center flex-row justify-center gap-2 border border-neutral-200/50 dark:border-neutral-700/30"
            >
              <Ionicons
                name="chevron-down"
                size={18}
                color={isDark ? "#d4d4d4" : "#404040"}
              />
              <Text className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
                Minimizar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePause}
              activeOpacity={0.8}
              className={`flex-1 py-3.5 rounded-2xl items-center flex-row justify-center gap-2 border ${isPaused ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200/50 dark:border-neutral-700/30"}`}
            >
              <Ionicons
                name={isPaused ? "play-outline" : "pause-outline"}
                size={18}
                color={isPaused ? (isDark ? "#fbbf24" : "#d97706") : (isDark ? "#d4d4d4" : "#404040")}
              />
              <Text className={`font-semibold text-sm ${isPaused ? "text-amber-600 dark:text-amber-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                {isPaused ? "Reanudar" : "Pausar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isActive ? (
          // ACTIVE WORKOUT RENDERING
          <>
            {plannedSteps.map((step, index) => {
              if (step.type === "rest") {
                return (
                  <View
                    key={step.id}
                    className="bg-blue-50/30 dark:bg-blue-950/10 border border-dashed border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl flex-row items-center gap-3"
                  >
                    <Ionicons name="timer-outline" size={20} color={colors.blue[500]} />
                    <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      Descanso: {step.duration}s
                    </Text>
                  </View>
                );
              }

              const set = step;
              const exercise = EXERCISES.find(
                (e) => e.exerciseId === set.exerciseId,
              );

              if (!exercise) return <Text className="p-4 text-center dark:text-white" key={set.id}>No se encontró el ejercicio</Text>;

              const loggedSet = workoutSession?.sets.find(
                (s) => s.id === set.id,
              );

              const isCompleted = loggedSet?.completed;
              const setTypeObj = SET_TYPES.find((t) => t.id === set.type);

              return (
                <TouchableOpacity
                  key={set.id}
                  activeOpacity={0.85}
                  onPress={() => openRegisterModal(set.id, set.exerciseId, set)}
                  className={`p-4 border rounded-2xl gap-3 transition-colors ${
                    isCompleted
                      ? "border-emerald-500/40 dark:border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/10 dark:bg-neutral-900/10"
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-neutral-700 dark:text-neutral-300 font-bold text-sm">
                        Set {index + 1}
                      </Text>
                      {setTypeObj && set.type !== "effective" && (
                        <View
                          style={{ backgroundColor: setTypeObj.color[500] + "15" }}
                          className="px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/20"
                        >
                          <Text
                            style={{ color: setTypeObj.color[500] }}
                            className="text-[10px] font-bold uppercase tracking-wider"
                          >
                            {setTypeObj.label}
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        useWorkoutsHistoryStore
                          .getState()
                          .toggleSetCompleted(date, set.id, set.exerciseId);
                        updateInteractionTime();
                      }}
                      activeOpacity={0.8}
                      className={`w-7 h-7 rounded-full items-center justify-center border ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-neutral-300 dark:border-neutral-600 bg-transparent"
                      }`}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View>
                    <Text className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                      {capitalize(exercise.name)}
                    </Text>
                  </View>

                  {/* Metrics Table Grid */}
                  <View className="flex-row gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/40 justify-between">
                    <View className="items-center flex-1">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        Peso
                      </Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {loggedSet?.weight ? `${loggedSet.weight} kg` : set.weight?.value ? `${set.weight.value} kg` : "—"}
                      </Text>
                      {set.weight?.value && loggedSet?.weight && String(loggedSet.weight) !== String(set.weight.value) && (
                        <Text className="text-[9px] text-neutral-400 dark:text-neutral-500">Plan: {set.weight.value} kg</Text>
                      )}
                    </View>

                    <View className="items-center flex-1 border-x border-neutral-200/50 dark:border-neutral-800/50">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        Reps
                      </Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {loggedSet?.reps ? `${loggedSet.reps}` : set.reps?.value ? `${set.reps.value}` : "—"}
                      </Text>
                      {set.reps?.value && loggedSet?.reps && String(loggedSet.reps) !== String(set.reps.value) && (
                        <Text className="text-[9px] text-neutral-400 dark:text-neutral-500">Plan: {set.reps.value}</Text>
                      )}
                    </View>

                    <View className="items-center flex-1">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        RIR
                      </Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {loggedSet?.rir ? `RIR ${loggedSet.rir}` : set.rir?.value ? `RIR ${set.rir.value}` : "—"}
                      </Text>
                      {set.rir?.value && loggedSet?.rir && String(loggedSet.rir) !== String(set.rir.value) && (
                        <Text className="text-[9px] text-neutral-400 dark:text-neutral-500">Plan: {set.rir.value}</Text>
                      )}
                    </View>
                  </View>

                  {/* DropSets Rendering */}
                  {set.dropSets && set.dropSets.length > 0 && (
                    <View className="gap-2 mt-1">
                      {set.dropSets.map((dropSet: any, dropIndex: number) => {
                        return (
                          <View
                            key={dropSet.id}
                            className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-900/30 items-center justify-between"
                          >
                            <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
                              Dropset {dropIndex + 1}
                            </Text>
                            <Text className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">
                              {dropSet.weight?.value ? `${dropSet.weight.value} kg` : "—"} × {dropSet.reps?.value ? dropSet.reps.value : "—"}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {extraSets.map((set, extraIndex) => {
              const exercise = EXERCISES.find(
                (e) => e.exerciseId === set.exerciseId,
              );

              if (!exercise)
                return <Text className="p-4 text-center dark:text-white" key={set.id}>No se encontró el ejercicio</Text>;

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
                      ? "border-emerald-500/40 dark:border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/10 dark:bg-neutral-900/10"
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-neutral-700 dark:text-neutral-300 font-bold text-sm">
                        Set {setNumber}
                      </Text>
                      <View className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/20">
                        <Text className="text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                          Extra
                        </Text>
                      </View>
                      {setTypeObj && set.type !== "effective" && (
                        <View
                          style={{ backgroundColor: setTypeObj.color[500] + "15" }}
                          className="px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/20"
                        >
                          <Text
                            style={{ color: setTypeObj.color[500] }}
                            className="text-[10px] font-bold uppercase tracking-wider"
                          >
                            {setTypeObj.label}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center gap-2.5">
                      <TouchableOpacity
                        onPress={() => removeSet(date, set.id)}
                        className="p-1"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          useWorkoutsHistoryStore
                            .getState()
                            .toggleSetCompleted(date, set.id, set.exerciseId);
                          updateInteractionTime();
                        }}
                        activeOpacity={0.8}
                        className={`w-7 h-7 rounded-full items-center justify-center border ${
                          completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-neutral-300 dark:border-neutral-600 bg-transparent"
                        }`}
                      >
                        {completed && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View>
                    <Text className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                      {capitalize(exercise.name)}
                    </Text>
                  </View>

                  {/* Metrics Table Grid */}
                  <View className="flex-row gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/40 justify-between">
                    <View className="items-center flex-1">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        Peso
                      </Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {weight !== undefined && weight !== null && weight !== "" ? `${weight} kg` : "—"}
                      </Text>
                    </View>

                    <View className="items-center flex-1 border-x border-neutral-200/50 dark:border-neutral-800/50">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        Reps
                      </Text>
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                        {reps !== undefined && reps !== null && reps !== "" ? reps : "—"}
                      </Text>
                    </View>

                    <View className="items-center flex-1">
                      <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                        RIR
                      </Text>
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
                            className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-900/30 items-center justify-between"
                          >
                            <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
                              Dropset {dropIndex + 1}
                            </Text>
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
          </>
        ) : (
          // REGISTERED WORKOUT RENDERING
          workoutSession?.sets.map((set, index) => {
            const exercise = EXERCISES.find(
              (e) => e.exerciseId === set.exerciseId,
            );

            if (!exercise)
              return <Text className="p-4 text-center dark:text-white" key={set.id}>No se encontró el ejercicio</Text>;

            const { weight, reps, rir, dropSets } = set as any;
            const setTypeObj = SET_TYPES.find((t) => t.id === set.type);

            return (
              <TouchableOpacity
                key={set.id}
                activeOpacity={0.85}
                onPress={() => openRegisterModal(set.id, set.exerciseId)}
                className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/10 dark:bg-neutral-900/10 gap-3"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-neutral-700 dark:text-neutral-300 font-bold text-sm">
                      Set {index + 1}
                    </Text>
                    {setTypeObj && set.type !== "effective" && (
                      <View
                        style={{ backgroundColor: setTypeObj.color[500] + "15" }}
                        className="px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-700/20"
                      >
                        <Text
                          style={{ color: setTypeObj.color[500] }}
                          className="text-[10px] font-bold uppercase tracking-wider"
                        >
                          {setTypeObj.label}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => removeSet(date, set.id)}
                    className="p-1"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                    {capitalize(exercise.name)}
                  </Text>
                </View>

                {/* Metrics Table Grid */}
                <View className="flex-row gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/40 justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                      Peso
                    </Text>
                    <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {weight !== undefined && weight !== null && weight !== "" ? `${weight} kg` : "—"}
                    </Text>
                  </View>

                  <View className="items-center flex-1 border-x border-neutral-200/50 dark:border-neutral-800/50">
                    <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                      Reps
                    </Text>
                    <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                      {reps !== undefined && reps !== null && reps !== "" ? reps : "—"}
                    </Text>
                  </View>

                  <View className="items-center flex-1">
                    <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                      RIR
                    </Text>
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
                          className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-900/30 items-center justify-between"
                        >
                          <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
                            Dropset {dropIndex + 1}
                          </Text>
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
          })
        )}

        {/* BOTTOM ACTIVE ACTIONS */}
        {isActive && (
          <>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("exercises", { workoutSessionDate: date });
              }}
              activeOpacity={0.7}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-4 rounded-2xl items-center justify-center flex-row gap-2 mt-4"
            >
              <Ionicons name="add" size={20} color={colors.neutral[500]} />
              <Text className="text-neutral-500 font-bold">
                Añadir Ejercicio Libre
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={finishWorkout}
              activeOpacity={0.8}
              className="bg-green-500 dark:bg-green-600 p-4 rounded-2xl items-center justify-center flex-row gap-2 mb-8 mt-3 shadow-sm"
            >
              <Ionicons name="checkmark-done" size={20} color="white" />
              <Text className="text-white font-bold text-lg">
                Finalizar Entreno
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
