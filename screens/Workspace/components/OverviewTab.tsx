import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Workspace } from "@/types/Workspace";

import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";

import { randomId } from "@/utils/random";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { memo, useMemo } from "react";
import { capitalize } from "@/lib/utils";
import { SET_TYPES } from "@/constants/SetTypes";

import EXERCISES from "@/assets/data/exercises.json";
import { Routine } from "@/types/Routine";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { dayNames } from "@/constants/DayNames";
import { SelectRoutineModal } from "@/components/modals/SelectRoutineModal";
import { useModalStore } from "@/stores/useModalStore";
import { Image } from "expo-image";
import RoutineQuickView from "@/components/RoutineQuickView";

export default function OverviewTab({ workspace }: { workspace: Workspace }) {
  const navigation = useNavigation();

  const updateWorkspace = useWorkspacesStore((s) => s.updateWorkspace);

  const routines = useRoutinesStore((s) => s.routines);

  const routine = routines.find((r) => r.id === workspace.routineId);

  const handleCreateRoutine = () => {
    navigation.navigate("createRoutine");
  };

  const showModal = useModalStore((s) => s.showModal);
  const addRoutine = useRoutinesStore((s) => s.addRoutine);

  const handleImportRoutine = () => {
    showModal({
      snapPoints: ["60%", "90%"],
      content: (
        <SelectRoutineModal
          hideTemplate
          onSelectRoutine={(selectedRoutine, asTemplate) => {
            if (asTemplate) {
              const newRoutineId = randomId();
              const newDays = selectedRoutine.days.map((day) => ({
                ...day,
                id: randomId(),
              }));
              addRoutine({
                ...selectedRoutine,
                id: newRoutineId,
                name: `${selectedRoutine.name} (Copia)`,
                days: newDays,
                createdAt: new Date().toISOString(),
              });
              updateWorkspace(workspace.id, "routineId", newRoutineId);
            } else {
              updateWorkspace(workspace.id, "routineId", selectedRoutine.id);
            }
          }}
        />
      ),
    });
  };

  const handleRemoveRoutine = () => {
    updateWorkspace(workspace.id, "routineId", null);
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      contentContainerClassName="p-3 gap-3"
    >
      <View className="flex-row items-center gap-3 justify-end">
        <TouchableOpacity className="p-4 rounded-lg flex-1 bg-black border border-black flex-row items-center justify-center gap-2">
          <Ionicons name="add-outline" className="!text-base !leading-none" color="white" />
          <Text className="text-base text-white font-medium">Invitar a alguien</Text>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 rounded-lg border flex-1 border-neutral-200 flex-row items-center justify-center gap-2">
          <Ionicons name="settings-outline" className="!text-base !leading-none" color={colors.neutral[500]} />
          <Text className="text-base text-neutral-500 font-medium">Configuracion</Text>
        </TouchableOpacity>
      </View>

      {routine ? (
        <View className="gap-3">
          <RoutineQuickView routine={routine} />
          <WorkoutView routine={routine} />
          <TouchableOpacity
            onPress={handleRemoveRoutine}
            className="border border-neutral-200 rounded-xl p-3 justify-center items-center gap-1 flex-row"
          >
            <Ionicons name="close-circle-outline" className="!text-base !leading-none" color={colors.neutral[400]} />
            <Text className="text-neutral-400 font-medium text-center">Desligar rutina del workspace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-full justify-center items-center flex-row gap-3">
          <TouchableOpacity
            onPress={handleCreateRoutine}
            className="border-1.5 border-neutral-200 aspect-square border-dashed p-8 flex-1 rounded-2xl items-center justify-center gap-3"
          >
            <Ionicons name="add-outline" size={29} color={colors.neutral[400]} />
            <Text className="text-neutral-400 font-semibold text-lg">Crear rutina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border-1.5 border-neutral-200 aspect-square border-dashed p-8 flex-1 rounded-2xl items-center justify-center gap-3"
            onPress={handleImportRoutine}
          >
            <Ionicons name="download-outline" size={28} color={colors.neutral[400]} />
            <Text className="text-neutral-400 font-semibold text-lg">Usar existente</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const RestView = ({ todayNumber, routineId }: { todayNumber: number; routineId: string }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("routine", { routineId: routineId })}
      className="flex-1 rounded-3xl flex-row p-5 border border-neutral-200 gap-5"
    >
      <View>
        <Text className="text-neutral-400 font-medium text-sm uppercase tracking-wider">{dayNames[todayNumber]}</Text>
        <Text className="font-bold text-2xl">Descanso</Text>
      </View>

      <View className="justify-center items-center flex-1">
        <Image
          source={
            "https://png.pngtree.com/png-clipart/20231222/original/pngtree-blissful-rest-cartoon-bear-relishing-lazy-hammock-afternoon-png-image_13912197.png"
          }
          style={{ width: 228, height: 228 }}
        />
      </View>
    </TouchableOpacity>
  );
};

const WorkoutView = ({ routine }: { routine: Routine }) => {
  const navigation = useNavigation();

  const adjustedDay = (new Date().getDay() + 6) % 7; // Map 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
  const today = routine.days.find((d) => d.dayIndex === adjustedDay);

  if (today?.isRestDay || !today) return <RestView todayNumber={adjustedDay} routineId={routine.id} />;

  const workouts = useWorkoutsStore((s) => s.workouts);

  if (today.workoutId === null)
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("routine", { routineId: routine.id })}
        className="flex-1 rounded-3xl p-5 border border-neutral-200"
      >
        <View className="mb-5 flex-row items-start justify-between">
          <View>
            <Text className="text-neutral-400 font-medium text-sm uppercase tracking-wider">
              {dayNames[today.dayIndex]}
            </Text>
            <Text className="font-bold text-2xl">Entreno</Text>
          </View>

          <View className="justify-center items-start flex-row gap-1">
            <Ionicons name="create-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
            <Text className="text-neutral-400 text-sm">Editar entreno</Text>
          </View>
        </View>

        <Text className="text-neutral-400 text-sm text-center">Entreno no asignado</Text>
      </TouchableOpacity>
    );

  const todaysWorkout = workouts.find((w) => w.id === today.workoutId);

  if (!todaysWorkout) return <Text>Hubo un problema, no se encontro el entreno</Text>;

  if (!todaysWorkout.steps.length)
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("editWorkout", { workoutId: todaysWorkout.id })}
        className="flex-1 rounded-3xl p-5 border border-neutral-200"
      >
        <View className="mb-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-neutral-400 font-medium text-sm uppercase tracking-wider">
              {dayNames[today.dayIndex]}
            </Text>

            <View className="justify-center items-start flex-row gap-1">
              <Ionicons name="create-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
              <Text className="text-neutral-400 text-sm">Editar entreno</Text>
            </View>
          </View>

          <Text className="font-bold text-2xl">{todaysWorkout.name || "Entrenamiento"}</Text>
        </View>

        <Text className="text-neutral-400 text-sm text-center">Tu rutina todavia no tiene ejercicios</Text>
      </TouchableOpacity>
    );

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("editWorkout", { workoutId: todaysWorkout.id })}
      className="flex-1  rounded-3xl p-5 border border-neutral-200"
    >
      <View className="mb-5">
        <View className="flex-row justify-between items-center">
          <Text className="text-neutral-400 font-medium text-sm uppercase tracking-wider">
            {dayNames[today.dayIndex]}
          </Text>

          <View className="justify-center items-start flex-row gap-1">
            <Ionicons name="create-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
            <Text className="text-neutral-400 text-sm">Editar entreno</Text>
          </View>
        </View>

        <Text className="font-bold text-2xl">{todaysWorkout.name || "Entrenamiento"}</Text>
      </View>

      <View className="gap-3 px-1">
        {todaysWorkout.steps.slice(0, 6).map((step) => (
          <Step key={step.id} step={step} />
        ))}
        {todaysWorkout.steps.length > 6 && (
          <Text className="text-neutral-400 text-xs mt-1 ml-5">+ {todaysWorkout.steps.length - 6} más...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const Rest = memo(({ step }: { step: any }) => {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl px-3 py-2">
      <Ionicons name="time-outline" size={14} color={colors.neutral[600]} />
      <Text className="text-neutral-600 font-medium" numberOfLines={1}>
        Descanso {step?.duration}s
      </Text>
    </View>
  );
});

const Step = memo(({ step }: { step: any }) => {
  if (step.type === "rest") return <Rest step={step} />;

  const exercise = useMemo(() => EXERCISES.find((e) => e.exerciseId === step.exerciseId), [step.exerciseId]);

  if (!exercise) return <Text>No se encontro el ejercicio</Text>;

  const weightUnit = useGlobalSettingsStore((s) => s.weightUnit);

  const setType = SET_TYPES.find((s) => s.id === step.type) || SET_TYPES[0];

  const { weight, reps, rir } = step;

  const validWeight = (weight.isRange && weight.min && weight.max) || weight.value;
  const validReps = (reps.isRange && reps.min && reps.max) || reps.value;
  const validRir = (rir.isRange && rir.min && rir.max) || rir.value;

  return (
    <View className="rounded-xl p-4 border border-neutral-100">
      <Text
        className="font-medium text-sm"
        style={{
          color: setType.color[500],
        }}
      >
        {setType.label}
      </Text>

      <Text className="text-neutral-800 font-medium" numberOfLines={1}>
        {capitalize(exercise.name) || "Ejercicio"}
      </Text>

      <View className="flex-row gap-3">
        {validWeight && (
          <Text>
            {weight.isRange ? `${weight.min} - ${weight.max}` : weight.value} {weightUnit}
          </Text>
        )}
        {validReps && <Text>x{reps.isRange ? `${reps.min} - ${reps.max}` : reps.value} reps</Text>}
        {validRir && <Text>rir {rir.isRange ? `${rir.min} - ${rir.max}` : rir.value}</Text>}
      </View>
    </View>
  );
});
