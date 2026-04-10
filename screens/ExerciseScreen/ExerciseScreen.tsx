import { capitalize } from "@/lib/utils";
import { RootStackParamList } from "@/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { randomId } from "@/utils/random";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";

import Instructions from "./components/Instructions";
import { ExerciseTranslations, Set } from "./types";
import SetItem from "./components/Series/SetItem";
import HeaderInfo from "./components/HeaderInfo";
import { useGlobalRoutinesSettings } from "@/stores/GlobalRoutinesSettings";
import { useModalStore } from "@/stores/useModalStore";
import PartialRepsModal from "./modals/PartialRepsModal";
import { useRoutines } from "@/stores/RoutinesStore";

interface ExerciseScreenProps {
  navigation: any;
  route: RouteProp<RootStackParamList, "exercise">;
}

export default function ExerciseScreen({
  navigation,
  route,
}: ExerciseScreenProps) {
  const exercise = route.params?.exercise;

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const showModal = useModalStore((state) => state.showModal);
  const setRoutines = useRoutines((state) => state.setRoutines);

  const weightUnit = useGlobalRoutinesSettings((state) => state.weightUnit);
  const showSliders = useGlobalRoutinesSettings((state) => state.showSliders);
  const advancedMode = useGlobalRoutinesSettings((state) => state.advancedMode);
  const toggleWeightUnit = useGlobalRoutinesSettings(
    (state) => state.toggleWeightUnit,
  );
  const toggleShowSliders = useGlobalRoutinesSettings(
    (state) => state.toggleShowSliders,
  );
  const toggleAdvancedMode = useGlobalRoutinesSettings(
    (state) => state.toggleAdvancedMode,
  );

  const [exerciseSets, setExerciseSets] = useState<Set[]>([
    {
      id: "1",
      weight: "",
      reps: "",
      rir: "",
      type: "effective",
      weightIsRange: false,
      repsIsRange: false,
      rirIsRange: false,
      dropSets: [],
      partialReps: {
        count: "",
        rom: "",
        customRom: "",
      },
      notes: { enabled: false, text: "" },
    },
  ]);

  console.log(exerciseSets);

  const exerciseKey = exercise.name.toLowerCase();
  const translatedExercise = t(`exercises.${exerciseKey}`, {
    returnObjects: true,
    defaultValue: {},
  }) as ExerciseTranslations;
  const displayName =
    translatedExercise?.name ??
    (exercise?.name ? capitalize(exercise.name) : "");
  const instructions =
    translatedExercise?.instructions ?? exercise?.instructions ?? [];

  useEffect(() => {
    if (displayName) {
      navigation.setOptions({ title: displayName });
    }
  }, [displayName, navigation]);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      Keyboard.dismiss();
    });

    return () => {
      hideSubscription.remove();
    };
  }, []);

  const addSet = ({
    weight,
    reps,
    rir,
  }: {
    weight?: string;
    reps?: string;
    rir?: string;
  }) => {
    const newId = randomId();
    const lastSet = exerciseSets[exerciseSets.length - 1];
    setExerciseSets((prev) => [
      ...prev,
      {
        id: newId,
        weight: weight ?? lastSet?.weight ?? "",
        reps: reps ?? lastSet?.reps ?? "10",
        rir: rir ?? lastSet?.rir ?? "0",
        type: lastSet?.type ?? "effective",
        weightIsRange: false,
        repsIsRange: false,
        rirIsRange: false,
        dropSets: [],
        partialReps: {
          count: "",
          rom: "",
          customRom: "",
        },
        notes: { enabled: false, text: "" },
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteSet = (id: string) => {
    setExerciseSets((prev) =>
      prev.length > 1 ? prev.filter((s) => s.id !== id) : prev,
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateSetField = (setId: string, field: string, value: any) => {
    setExerciseSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
    );
  };

  const toggleDropSets = (set: Set) => {
    if (set?.dropSets?.length > 0) {
      deleteDropSet(set.id, set.dropSets[set.dropSets.length - 1].id);
      return;
    }

    addDropSet(set.id);
  };

  const addDropSet = (setId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        const newDropSetId = randomId();
        const newDropSet = {
          id: newDropSetId,
          weight: s.dropSets?.length
            ? s.dropSets[s.dropSets.length - 1].weight
            : s.weight,
          reps: s.dropSets?.length
            ? s.dropSets[s.dropSets.length - 1].reps
            : s.reps,
          rir: s.dropSets?.length
            ? s.dropSets[s.dropSets.length - 1].rir
            : s.rir,
          partialReps: {
            count: "",
            rom: "",
            customRom: "",
          },
        };
        return { ...s, dropSets: [...(s.dropSets || []), newDropSet] };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteDropSet = (setId: string, dropSetId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return {
          ...s,
          dropSets: s.dropSets?.filter((ds: any) => ds.id !== dropSetId),
        };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateDropSetField = (
    setId: string,
    dropSetId: string,
    field: string,
    value: any,
  ) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return {
          ...s,
          dropSets: s.dropSets?.map((ds: any) =>
            ds.id === dropSetId ? { ...ds, [field]: value } : ds,
          ),
        };
      }),
    );
  };

  const updateDropSetPartialRepsField = (
    setId: string,
    dropSetId: string,
    field: string,
    value: any,
  ) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return {
          ...s,
          dropSets: s.dropSets?.map((ds: any) =>
            ds.id === dropSetId
              ? {
                  ...ds,
                  partialReps: { ...ds.partialReps, [field]: value },
                }
              : ds,
          ),
        };
      }),
    );
  };

  const deletePartialReps = (setId: string, dropSetId?: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        if (dropSetId) {
          return {
            ...s,
            dropSets: s.dropSets?.map((ds: any) =>
              ds.id === dropSetId
                ? {
                    ...ds,
                    partialReps: {
                      count: "",
                      rom: "",
                      customRom: "",
                    },
                  }
                : ds,
            ),
          };
        }
        return {
          ...s,
          partialReps: {
            count: "",
            rom: "",
            customRom: "",
          },
        };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openPartialRepsModal = (
    set: any,
    updateFn: (id: string, field: string, value: any) => void,
  ) => {
    showModal({
      content: <PartialRepsModal set={set} updatePartialRepsField={updateFn} />,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updatePartialRepsField = (setId: string, field: string, value: any) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return { ...s, partialReps: { ...s.partialReps, [field]: value } };
      }),
    );
  };

  const toggleNotes = (setId: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return {
          ...s,
          notes: { enabled: s.notes.enabled ? false : true, text: "" },
        };
      }),
    );
  };

  const updateNotes = (setId: string, note: string) => {
    setExerciseSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;
        return { ...s, notes: { ...s.notes, text: note } };
      }),
    );
  };

  const addToRoutine = () => {
    setRoutines((prev) => {
      console.log("Routines asdsa", prev);
    });
  };

  if (!exercise) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t("screens.exercise.notFound")}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Content */}
        <View className="pb-3">
          <TouchableOpacity onPress={addToRoutine}>
            <Text>Agregar a la rutina</Text>
          </TouchableOpacity>

          {/* Header Info */}
          <HeaderInfo exercise={exercise} />

          {/* Series List */}
          <View className="mb-5">
            <View className="mb-3 px-3 items-center flex-1 flex-row">
              <Text className="text-lg font-bold text-neutral-800">Series</Text>
            </View>

            {/* Series Config */}

            <View className="gap-4 flex-row items-center justify-end pr-3">
              {/* Toggle Peso */}

              <TouchableOpacity
                onPress={toggleWeightUnit}
                className="flex-row items-center justify-center gap-0.5"
              >
                <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">
                  Peso ({weightUnit})
                </Text>
                <Ionicons
                  name="repeat"
                  size={12}
                  className="!text-neutral-400"
                />
              </TouchableOpacity>

              {/* Toggle Sliders */}

              <TouchableOpacity
                onPress={toggleShowSliders}
                className="flex-row items-center justify-center gap-0.5"
              >
                <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">
                  Sliders
                </Text>

                <Ionicons
                  name={showSliders ? "checkbox" : "square-outline"}
                  size={12}
                  className="!text-neutral-400"
                />
              </TouchableOpacity>

              {/* Toggle Modo Avanzado */}

              <TouchableOpacity
                onPress={toggleAdvancedMode}
                className="flex-row items-center justify-center gap-0.5"
              >
                <Text className="text-[10px] text-center font-medium uppercase text-neutral-400">
                  Modo Avanzado
                </Text>

                <Ionicons
                  name={advancedMode ? "checkbox" : "square-outline"}
                  size={12}
                  className="!text-neutral-400"
                />
              </TouchableOpacity>
            </View>

            {/* Sets List */}

            <View className="border-t border-neutral-100 gap-6 p-3">
              {exerciseSets.map((set, index) => (
                <SetItem
                  key={set.id}
                  set={set}
                  index={index}
                  setsCount={exerciseSets.length}
                  updateSetField={updateSetField}
                  deleteSet={() => deleteSet(set.id)}
                  setExerciseSets={setExerciseSets}
                  duplicateSet={() =>
                    addSet({ weight: set.weight, reps: set.reps, rir: set.rir })
                  }
                  addDropSet={() => addDropSet(set.id)}
                  updateDropSetField={updateDropSetField}
                  deleteDropSet={(dropSetId: string) =>
                    deleteDropSet(set.id, dropSetId)
                  }
                  toggleDropSets={() => toggleDropSets(set)}
                  openPartialRepsModal={() =>
                    openPartialRepsModal(set, updatePartialRepsField)
                  }
                  updatePartialRepsField={updatePartialRepsField}
                  updateDropSetPartialRepsField={updateDropSetPartialRepsField}
                  openDropSetPartialRepsModal={(dropSet: any) =>
                    openPartialRepsModal(dropSet, (id, field, value) =>
                      updateDropSetPartialRepsField(set.id, id, field, value),
                    )
                  }
                  deletePartialReps={(dropSetId?: string) =>
                    deletePartialReps(set.id, dropSetId)
                  }
                  toggleNotes={() => toggleNotes(set.id)}
                  updateNotes={(note: string) => updateNotes(set.id, note)}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => addSet({})}
              className="mx-3 flex-row items-center justify-center gap-2 rounded-md h-16"
            >
              <Ionicons name="add" size={20} className="!text-neutral-900" />
              <Text className="font-semibold text-sm text-neutral-900">
                AGREGAR SERIE
              </Text>
            </TouchableOpacity>
          </View>

          <Instructions>{instructions}</Instructions>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
