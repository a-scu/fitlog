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

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import EXERCISES from "@/assets/data/exercises.json";

import { capitalize } from "@/lib/utils";
import RegisterSetModal from "@/components/modals/RegisterSetModal";
import { useModalStore } from "@/stores/ModalStore";
import { isSameDay, startOfDay } from "date-fns";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useEffect } from "react";

const today = startOfDay(new Date()).toISOString();

export default function WorkoutSessionScreen({ route, navigation }: any) {
  const { date } = route.params || { date: today };

  const insets = useSafeAreaInsets();
  const workouts = useWorkoutsStore((s) => s.workouts);

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
  const startWorkout = useActiveWorkoutStore((s) => s.startWorkout);

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

  const handleMinimize = () => {
    navigation.goBack();
  };

  const handlePause = () => {
    if (isPaused) resumeWorkout();
    else pauseWorkout();
  };

  if (isActive && !workout)
    return <Text>Hubo un error con el entreno activo</Text>;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-neutral-900"
    >
      <ScrollView
        contentContainerClassName="gap-4 p-4 grow"
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        {!isActive && (
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              onPress={handleSelectExercises}
              className="flex-1 p-5 bg-black dark:bg-white rounded-lg items-center"
            >
              <Text className="text-white dark:text-black font-medium">
                Agregar ejercicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemoveAllSets}
              className="flex-1 p-5 bg-black dark:bg-white rounded-lg items-center"
            >
              <Text className="text-white dark:text-black font-medium">
                Eliminar registros
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isActive && (
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              onPress={handleMinimize}
              className="flex-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg items-center flex-row justify-center gap-2"
            >
              <Ionicons
                name="chevron-down"
                size={20}
                className="!text-black dark:!text-white"
              />
              <Text className="font-medium dark:text-white">Minimizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePause}
              className="flex-1 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg items-center flex-row justify-center gap-2"
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={20}
                className="!text-black dark:!text-white"
              />
              <Text className="font-medium dark:text-white">
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
                    className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-500 dark:border-neutral-600 p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <Text className="text-neutral-500 dark:text-neutral-400 font-medium">
                      Descanso: {step.duration}s
                    </Text>
                  </View>
                );
              }

              const set = step;

              const exercise = EXERCISES.find(
                (e) => e.exerciseId === set.exerciseId,
              );

              if (!exercise) return <Text>No se encontro el ejercicio</Text>;

              const loggedSet = workoutSession?.sets.find(
                (s) => s.id === set.id,
              );

              return (
                <TouchableOpacity
                  key={set.id}
                  onPress={() => openRegisterModal(set.id, set.exerciseId, set)}
                  className={`p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl ${loggedSet?.completed ? "border-green-500 dark:border-emerald-600 bg-green-50 dark:bg-emerald-900/30" : ""}`}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="dark:text-white">Set {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        useWorkoutsHistoryStore
                          .getState()
                          .toggleSetCompleted(date, set.id, set.exerciseId);
                        updateInteractionTime();
                      }}
                      className={`p-2 rounded-full ${loggedSet?.completed ? "bg-green-500" : "bg-neutral-200"}`}
                    >
                      <Ionicons
                        name={
                          loggedSet?.completed ? "checkmark" : "ellipse-outline"
                        }
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <Text className="text-lg font-bold dark:text-white">
                      {capitalize(exercise.name)}
                    </Text>
                  </View>

                  <View className="mt-2 mb-3 px-1 gap-1">
                    {set.weight?.value ? (
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                        Peso: {set.weight.value} (planeado)
                        {loggedSet?.weight ? (
                          <Text className="text-blue-600 dark:text-blue-400 font-bold">
                            {" "}
                            | {loggedSet.weight} (registrado)
                          </Text>
                        ) : null}
                      </Text>
                    ) : null}

                    {set.reps?.value ? (
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                        Reps: {set.reps.value} (planeado)
                        {loggedSet?.reps ? (
                          <Text className="text-blue-600 dark:text-blue-400 font-bold">
                            {" "}
                            | {loggedSet.reps} (registrado)
                          </Text>
                        ) : null}
                      </Text>
                    ) : null}

                    {set.rir?.value ? (
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                        RIR: {set.rir.value} (planeado)
                        {loggedSet?.rir ? (
                          <Text className="text-blue-600 dark:text-blue-400 font-bold">
                            {" "}
                            | {loggedSet.rir} (registrado)
                          </Text>
                        ) : null}
                      </Text>
                    ) : null}
                  </View>

                  {set.dropSets && set.dropSets.length > 0 && (
                    <View className="gap-1">
                      {set.dropSets.map((dropSet: any, index: number) => {
                        return (
                          <View
                            className="flex-row border rounded-xl p-3"
                            key={dropSet.id}
                          >
                            <Text>Dropset {index + 1}</Text>

                            <Text className="flex-1 text-center">
                              weight:{dropSet.weight?.value} reps:
                              {dropSet.reps?.value}
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
                return <Text key={set.id}>No se encontró el ejercicio</Text>;

              const { weight, reps, rir, dropSets, completed } = set as any;
              const setNumber = plannedSteps.length + extraIndex + 1;

              return (
                <TouchableOpacity
                  key={set.id}
                  onPress={() => openRegisterModal(set.id, set.exerciseId)}
                  className={`p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl ${completed ? "border-green-500 dark:border-emerald-600 bg-green-50 dark:bg-emerald-900/30" : ""}`}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="dark:text-white">Set {setNumber}</Text>
                    <View className="flex-row items-center gap-1">
                      <TouchableOpacity
                        onPress={() => removeSet(date, set.id)}
                        className="p-1"
                      >
                        <Ionicons
                          name="close-circle-outline"
                          className="!text-xl text-red-500"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          useWorkoutsHistoryStore
                            .getState()
                            .toggleSetCompleted(date, set.id, set.exerciseId);
                          updateInteractionTime();
                        }}
                        className={`p-2 rounded-full ${completed ? "bg-green-500" : "bg-neutral-200"}`}
                      >
                        <Ionicons
                          name={completed ? "checkmark" : "ellipse-outline"}
                          size={20}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <Text className="text-lg font-bold dark:text-white">
                      {capitalize(exercise.name)}
                    </Text>
                  </View>

                  <View className="mt-2 mb-3 px-1 gap-1">
                    {weight !== undefined &&
                    weight !== null &&
                    weight !== "" ? (
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                        Peso:{" "}
                        <Text className="text-blue-600 dark:text-blue-400 font-bold">
                          {weight}
                        </Text>
                      </Text>
                    ) : null}

                    {reps !== undefined && reps !== null && reps !== "" ? (
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                        Reps:{" "}
                        <Text className="text-blue-600 dark:text-blue-400 font-bold">
                          {reps}
                        </Text>
                      </Text>
                    ) : null}

                    {rir !== undefined && rir !== null && rir !== "" ? (
                      <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                        RIR:{" "}
                        <Text className="text-blue-600 dark:text-blue-400 font-bold">
                          {rir}
                        </Text>
                      </Text>
                    ) : null}
                  </View>

                  {dropSets && dropSets.length > 0 && (
                    <View className="gap-1">
                      {dropSets.map((dropSet: any, dropIndex: number) => {
                        return (
                          <View
                            className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3"
                            key={dropSet.id}
                          >
                            <Text className="dark:text-white">
                              Dropset {dropIndex + 1}
                            </Text>

                            <Text className="flex-1 text-center dark:text-white">
                              weight:{dropSet.weight} reps:{dropSet.reps}
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
              return <Text key={set.id}>No se encontro el ejercicio</Text>;

            const { weight, reps, rir, dropSets } = set as any;

            return (
              <TouchableOpacity
                key={set.id}
                onPress={() => openRegisterModal(set.id, set.exerciseId)}
                className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl"
              >
                <Text className="dark:text-white">Set {index + 1}</Text>

                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => removeSet(date, set.id)}
                    className="p-3"
                  >
                    <Ionicons
                      name="close-circle-outline"
                      className="!text-xl text-red-500"
                    />
                  </TouchableOpacity>
                  <Text className="text-lg dark:text-white">
                    {capitalize(exercise.name)}
                  </Text>
                </View>

                <View className="flex-row gap-3 items-center justify-evenly mb-3">
                  {weight !== undefined && weight !== null && (
                    <Text className="text-lg dark:text-white">
                      weight: {weight}
                    </Text>
                  )}
                  {reps !== undefined && reps !== null && (
                    <Text className="text-lg dark:text-white">
                      reps: {reps}
                    </Text>
                  )}
                  {rir !== undefined && rir !== null && (
                    <Text className="text-lg dark:text-white">rir: {rir}</Text>
                  )}
                </View>

                {dropSets && dropSets.length > 0 && (
                  <View className="gap-1">
                    {dropSets.map((dropSet: any, dropIndex: number) => {
                      return (
                        <View
                          className="flex-row border border-neutral-200 dark:border-neutral-800 rounded-xl p-3"
                          key={dropSet.id}
                        >
                          <Text className="dark:text-white">
                            Dropset {dropIndex + 1}
                          </Text>

                          <Text className="flex-1 text-center dark:text-white">
                            weight:{dropSet.weight} reps:{dropSet.reps}
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

        {isActive && (
          <>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("exercises", { workoutSessionDate: date });
              }}
              className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-4 rounded-2xl items-center justify-center flex-row gap-2 mt-4"
            >
              <Ionicons name="add" size={24} color={colors.neutral[500]} />
              <Text className="text-neutral-500 font-bold">
                Añadir Ejercicio Libre
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={finishWorkout}
              className="bg-black dark:bg-white p-4 rounded-2xl items-center justify-center flex-row gap-2 mb-8 mt-2"
            >
              <Text className="text-white dark:text-black font-bold text-lg">
                Finalizar Entreno
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
