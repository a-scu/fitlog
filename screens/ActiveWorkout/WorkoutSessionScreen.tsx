import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import EXERCISES from "@/assets/data/exercises.json";

import { capitalize } from "@/lib/utils";
import RegisterSetModal from "@/components/modals/RegisterSetModal";
import { useModalStore } from "@/stores/useModalStore";
import { isSameDay, startOfDay } from "date-fns";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";

const today = startOfDay(new Date()).toISOString();

export default function WorkoutSessionScreen({ route, navigation }: any) {
  const { date } = route.params || { date: today };

  const insets = useSafeAreaInsets();
  const workouts = useWorkoutsStore((s) => s.workouts);
  const {
    activeWorkoutId,
    pauseWorkout,
    resumeWorkout,
    isPaused,
    finishWorkout: storeFinishWorkout,
  } = useActiveWorkoutStore((s) => s);

  const showModal = useModalStore((s) => s.showModal);

  const workout =
    activeWorkoutId === "free" ? { steps: [], name: "Entreno Libre" } : workouts.find((w) => w.id === activeWorkoutId);

  const workoutSessions = useWorkoutsHistoryStore((s) => s.workoutSessions);
  const workoutSession = workoutSessions.find((w) => isSameDay(w.date, date));
  const removeSet = useWorkoutsHistoryStore((s) => s.removeSet);

  const isActive = activeWorkoutId !== null && isSameDay(date, today);

  const openRegisterModal = (setId: string, exerciseId: string, plannedSet?: any) => {
    showModal({
      withBottomSheetView: false,
      content: <RegisterSetModal date={date} setId={setId} exerciseId={exerciseId} plannedSet={plannedSet} />,
    });
  };

  const handleSelectExercises = () => {
    navigation.navigate("exercises", { workoutSessionDate: date });
  };

  const finishWorkout = () => {
    useWorkoutsHistoryStore.getState().updateWorkoutSessionField(date, "status", "completed");
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

  if (isActive && !workout) return <Text>Hubo un error con el entreno activo</Text>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-4 p-4 grow" contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {!isActive && (
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity onPress={handleSelectExercises} className="flex-1 p-5 bg-black rounded-lg items-center">
              <Text className="text-white font-medium">Agregar ejercicio</Text>
            </TouchableOpacity>
            {workoutSession?.status === "completed" && (
              <TouchableOpacity
                className="p-5 bg-red-100 border border-red-500 rounded-lg items-center justify-center"
                onPress={() => {
                  Alert.alert(
                    "Reiniciar Entreno",
                    "¿Estás seguro que deseas reiniciar el entreno? Se perderán todos los sets registrados.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Reiniciar",
                        style: "destructive",
                        onPress: () => {
                          useWorkoutsHistoryStore.getState().updateWorkoutSessionField(date, "status", "in_progress");
                          useWorkoutsHistoryStore.getState().updateWorkoutSessionField(date, "sets", []);
                          navigation.goBack();
                        },
                      },
                    ],
                  );
                }}
              >
                <Ionicons name="refresh" size={20} color="red" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {isActive && (
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              onPress={handleMinimize}
              className="flex-1 p-3 bg-neutral-100 rounded-lg items-center flex-row justify-center gap-2"
            >
              <Ionicons name="chevron-down" size={20} color="black" />
              <Text className="font-medium">Minimizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePause}
              className="flex-1 p-3 bg-neutral-100 rounded-lg items-center flex-row justify-center gap-2"
            >
              <Ionicons name={isPaused ? "play" : "pause"} size={20} color="black" />
              <Text className="font-medium">{isPaused ? "Reanudar" : "Pausar"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isActive
          ? // ACTIVE WORKOUT RENDERING
            workout!.steps.map((step, index) => {
              if (step.type === "rest") {
                return (
                  <View
                    key={step.id}
                    className="bg-neutral-50 border border-neutral-500 p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <Text className="text-neutral-500 font-medium">Descanso: {step.duration}s</Text>
                  </View>
                );
              }

              const set = step;

              const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

              if (!exercise) return <Text>No se encontro el ejercicio</Text>;

              const loggedSet = workoutSession?.sets.find((s) => s.id === set.id);

              return (
                <TouchableOpacity
                  key={set.id}
                  onPress={() => openRegisterModal(set.id, set.exerciseId, set)}
                  className={`p-3 border rounded-xl ${loggedSet?.completed ? "border-green-500 bg-green-50" : ""}`}
                >
                  <View className="flex-row justify-between items-center">
                    <Text>Set {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        useWorkoutsHistoryStore.getState().toggleSetCompleted(today, set.id, set.exerciseId)
                      }
                      className={`p-2 rounded-full ${loggedSet?.completed ? "bg-green-500" : "bg-neutral-200"}`}
                    >
                      <Ionicons name={loggedSet?.completed ? "checkmark" : "ellipse-outline"} size={20} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <Text className="text-lg font-bold">{capitalize(exercise.name)}</Text>
                  </View>

                  <View className="mt-2 mb-3 px-1 gap-1">
                    {set.weight?.value ? (
                      <Text className="text-sm text-neutral-600">
                        Peso: {set.weight.value} (planeado)
                        {loggedSet?.weight ? (
                          <Text className="text-blue-600 font-bold"> | {loggedSet.weight} (registrado)</Text>
                        ) : null}
                      </Text>
                    ) : null}

                    {set.reps?.value ? (
                      <Text className="text-sm text-neutral-600">
                        Reps: {set.reps.value} (planeado)
                        {loggedSet?.reps ? (
                          <Text className="text-blue-600 font-bold"> | {loggedSet.reps} (registrado)</Text>
                        ) : null}
                      </Text>
                    ) : null}

                    {set.rir?.value ? (
                      <Text className="text-sm text-neutral-600">
                        RIR: {set.rir.value} (planeado)
                        {loggedSet?.rir ? (
                          <Text className="text-blue-600 font-bold"> | {loggedSet.rir} (registrado)</Text>
                        ) : null}
                      </Text>
                    ) : null}
                  </View>

                  {set.dropSets && set.dropSets.length > 0 && (
                    <View className="gap-1">
                      {set.dropSets.map((dropSet: any, index: number) => {
                        return (
                          <View className="flex-row border rounded-xl p-3" key={dropSet.id}>
                            <Text>Dropset {index + 1}</Text>

                            <Text className="flex-1 text-center">
                              weight:{dropSet.weight?.value} reps:{dropSet.reps?.value}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          : // REGISTERED WORKOUT RENDERING
            workoutSession?.sets.map((set, index) => {
              const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

              if (!exercise) return <Text key={set.id}>No se encontro el ejercicio</Text>;

              const { weight, reps, rir, dropSets } = set as any;

              return (
                <TouchableOpacity
                  key={set.id}
                  onPress={() => openRegisterModal(set.id, set.exerciseId)}
                  className="p-3 border rounded-xl"
                >
                  <Text>Set {index + 1}</Text>

                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => removeSet(date, set.id)} className="p-3">
                      <Ionicons name="close-circle-outline" className="!text-xl text-red-500" />
                    </TouchableOpacity>
                    <Text className="text-lg">{capitalize(exercise.name)}</Text>
                  </View>

                  <View className="flex-row gap-3 items-center justify-evenly mb-3">
                    {weight !== undefined && weight !== null && <Text className="text-lg">weight: {weight}</Text>}
                    {reps !== undefined && reps !== null && <Text className="text-lg">reps: {reps}</Text>}
                    {rir !== undefined && rir !== null && <Text className="text-lg">rir: {rir}</Text>}
                  </View>

                  {dropSets && dropSets.length > 0 && (
                    <View className="gap-1">
                      {dropSets.map((dropSet: any, dropIndex: number) => {
                        return (
                          <View className="flex-row border rounded-xl p-3" key={dropSet.id}>
                            <Text>Dropset {dropIndex + 1}</Text>

                            <Text className="flex-1 text-center">
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

        {isActive && (
          <>
            <TouchableOpacity className="border-2 border-dashed border-neutral-300 p-4 rounded-2xl items-center justify-center flex-row gap-2 mt-4">
              <Ionicons name="add" size={24} color={colors.neutral[500]} />
              <Text className="text-neutral-500 font-bold">Añadir Ejercicio Libre</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={finishWorkout}
              className="bg-black p-4 rounded-2xl items-center justify-center flex-row gap-2 mb-8 mt-2"
            >
              <Text className="text-white font-bold text-lg">Finalizar Entreno</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
