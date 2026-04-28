import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Set as SetType } from "@/types/Workout";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useModalStore } from "@/stores/useModalStore";

import PartialReps from "./PartialReps";
import MetricInput from "./MetricInput";
import DropSets from "./DropSets";
import SetTypes from "./SetTypes";

import PartialRepsModal from "../modals/PartialRepsModal";
import colors from "tailwindcss/colors";

export default function Set({ set, index }: { set: SetType; index: number }) {
  const updateMetricField = useWorkoutsStore((s) => s.updateMetricField);
  const deleteStep = useWorkoutsStore((s) => s.deleteStep);
  const duplicateStep = useWorkoutsStore((s) => s.duplicateStep);
  const toggleDropSets = useWorkoutsStore((s) => s.toggleDropSets);
  const toggleNotes = useWorkoutsStore((s) => s.toggleNotes);
  const updateNotes = useWorkoutsStore((s) => s.updateNotes);
  const deletePartialReps = useWorkoutsStore((s) => s.deletePartialReps);
  const updatePartialRepsField = useWorkoutsStore((s) => s.updatePartialRepsField);
  const showModal = useModalStore((s) => s.showModal);

  const openPartialRepsModal = (step: any) => {
    showModal({
      content: <PartialRepsModal set={step} updatePartialRepsField={updatePartialRepsField} />,
    });
  };

  const weightUnit = useGlobalSettingsStore((state) => state.weightUnit);
  const advancedMode = useGlobalSettingsStore((state) => state.advancedMode);

  const hasPartialReps = set.partialReps.isRange ? set.partialReps.min && set.partialReps.max : set.partialReps.value;

  return (
    <View className="border border-neutral-200 rounded-md p-3">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <Text className="font-medium text-lg">Serie {index + 1}</Text>
        <SetTypes set={set} />
      </View>

      {/* Metrics Row */}
      <View className="flex-row gap-1.5 flex-1">
        {/* Weight */}
        <MetricInput
          label={`PESO (${weightUnit.toUpperCase()})`}
          metric={set.weight}
          onUpdateValue={(text) => updateMetricField(set.id, "weight", "value", text)}
          onUpdateMin={(text) => updateMetricField(set.id, "weight", "min", text)}
          onUpdateMax={(text) => updateMetricField(set.id, "weight", "max", text)}
          onToggleRange={() => updateMetricField(set.id, "weight", "isRange", !set.weight.isRange)}
        />

        {/* Reps */}
        <MetricInput
          label="REPES"
          metric={set.reps}
          onUpdateValue={(text) => updateMetricField(set.id, "reps", "value", text)}
          onUpdateMin={(text) => updateMetricField(set.id, "reps", "min", text)}
          onUpdateMax={(text) => updateMetricField(set.id, "reps", "max", text)}
          onToggleRange={() => updateMetricField(set.id, "reps", "isRange", !set.reps.isRange)}
        />

        {/* RIR */}
        {advancedMode && (
          <MetricInput
            label="RIR"
            metric={set.rir}
            onUpdateValue={(text) => updateMetricField(set.id, "rir", "value", text)}
            onUpdateMin={(text) => updateMetricField(set.id, "rir", "min", text)}
            onUpdateMax={(text) => updateMetricField(set.id, "rir", "max", text)}
            onToggleRange={() => updateMetricField(set.id, "rir", "isRange", !set.rir.isRange)}
          />
        )}
      </View>

      {/* Advanced Options */}
      {advancedMode && (
        <View className="flex-1 gap-2 mt-2">
          <View className="flex-row gap-1.5 w-full">
            <TouchableOpacity
              onPress={() => toggleDropSets(set.id)}
              className={`gap-1 flex-1 rounded-md flex-row p-3 border items-center justify-center ${set.dropSets.length > 0 ? "bg-neutral-100 border-neutral-300" : "border-neutral-200"}`}
            >
              <Ionicons
                name="return-down-forward-outline"
                className="text-sm"
                color={set.dropSets.length > 0 ? colors.neutral[500] : colors.neutral[400]}
              />
              <Text
                className={`text-sm text-medium ${set.dropSets.length > 0 ? "text-neutral-500" : "text-neutral-400"}`}
              >
                Drop Sets
              </Text>
            </TouchableOpacity>

            {/* Partial Reps */}
            <TouchableOpacity
              onPress={() => openPartialRepsModal(set)}
              className={`gap-1 flex-1 rounded-md flex-row p-3 border items-center justify-center ${hasPartialReps ? "bg-neutral-100 border-neutral-300" : "border-neutral-200"}`}
            >
              {hasPartialReps && (
                <TouchableOpacity onPress={() => deletePartialReps(set.id)}>
                  <Ionicons
                    name="close"
                    size={12}
                    className="mr-2"
                    color={hasPartialReps ? colors.neutral[500] : colors.neutral[400]}
                  />
                </TouchableOpacity>
              )}

              {hasPartialReps ? (
                <PartialReps set={set} />
              ) : (
                <Text className={`text-sm text-medium ${hasPartialReps ? "text-neutral-500" : "text-neutral-400"}`}>
                  Parciales
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Drop Sets */}
          {set?.dropSets?.length > 0 && <DropSets set={set} advancedMode={advancedMode} />}

          {/* Toggles Scroll */}
          <View className="flex-row gap-1.5">
            <TouchableOpacity
              onPress={() => toggleNotes(set.id)}
              className={`gap-1 rounded-md flex-row h-7 px-2 border items-center justify-center ${set.notes.enabled ? "bg-neutral-100 border-neutral-300" : "border-neutral-200"}`}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                className="text-sm"
                color={set.notes.enabled ? colors.neutral[500] : colors.neutral[400]}
              />
              <Text className={`text-sm text-medium ${set.notes.enabled ? "text-neutral-500" : "text-neutral-400"}`}>
                Notas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => duplicateStep(set.id)}
              className="gap-1 rounded-md flex-row h-7 px-2 border items-center justify-center border-neutral-200"
            >
              <Ionicons
                name="duplicate-outline"
                className="text-sm"
                color={set.notes.enabled ? colors.neutral[500] : colors.neutral[400]}
              />
              <Text className="text-sm text-medium text-neutral-400">Duplicar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteStep(set.id)}
              className="gap-1 rounded-md flex-row h-7 px-2 border items-center justify-center border-neutral-200"
            >
              <Ionicons
                name="trash-bin-outline"
                className="text-sm"
                color={set.notes.enabled ? colors.neutral[500] : colors.neutral[400]}
              />
              <Text className="text-sm text-medium text-neutral-400">Eliminar</Text>
            </TouchableOpacity>
          </View>

          {/* Notes input */}
          {set.notes.enabled && (
            <TextInput
              value={set.notes.text}
              className="border border-neutral-400 rounded-md h-24 text-sm p-3"
              multiline
              // numberOfLines={20}
              placeholder="Nota para esta serie..."
              style={{ textAlignVertical: "top" }}
              selectTextOnFocus
              onChangeText={(text) => updateNotes(set.id, text)}
              cursorColor={colors.neutral[400]}
            />
          )}
        </View>
      )}
    </View>
  );
}
