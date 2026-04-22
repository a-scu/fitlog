import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { Set as SetType } from "@/types/Routine";

import { useModalStore } from "@/stores/useModalStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import DropSets from "./DropSets";
import SetTypes from "./SetTypes";
import PartialReps from "./PartialReps";
import MetricInput from "./MetricInput";

import PartialRepsModal from "../modals/PartialRepsModal";

export default function Set({ set, index }: { set: SetType; index: number }) {
  const updateMetricField = useRoutinesStore((s) => s.updateMetricField);
  const deleteStep = useRoutinesStore((s) => s.deleteStep);
  const addSet = useRoutinesStore((s) => s.addSet);
  const toggleDropSets = useRoutinesStore((s) => s.toggleDropSets);
  const addDropSet = useRoutinesStore((s) => s.addDropSet);
  const toggleNotes = useRoutinesStore((s) => s.toggleNotes);
  const updateNotes = useRoutinesStore((s) => s.updateNotes);
  const deletePartialReps = useRoutinesStore((s) => s.deletePartialReps);
  const updatePartialRepsField = useRoutinesStore((s) => s.updatePartialRepsField);
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
    <View className="gap-1 border bg-neutral-200 rounded-xl p-2">
      {/* Header */}
      <View className="flex-row px-2">
        <Text>SERIE {index + 1}</Text>
        <SetTypes set={set} />
      </View>

      {/* Metrics Row */}
      <View className="flex-row gap-1 px-1 flex-1">
        {/* Weight */}
        <MetricInput
          label={<Text>PESO ({weightUnit})</Text>}
          metric={set.weight}
          onUpdateValue={(text) => updateMetricField(set.id, "weight", "value", text)}
          onUpdateMin={(text) => updateMetricField(set.id, "weight", "min", text)}
          onUpdateMax={(text) => updateMetricField(set.id, "weight", "max", text)}
          onToggleRange={() => updateMetricField(set.id, "weight", "isRange", !set.weight.isRange)}
        />

        {/* Reps */}
        <MetricInput
          label={<Text>REPES</Text>}
          metric={set.reps}
          onUpdateValue={(text) => updateMetricField(set.id, "reps", "value", text)}
          onUpdateMin={(text) => updateMetricField(set.id, "reps", "min", text)}
          onUpdateMax={(text) => updateMetricField(set.id, "reps", "max", text)}
          onToggleRange={() => updateMetricField(set.id, "reps", "isRange", !set.reps.isRange)}
        />

        {/* RIR */}
        {advancedMode && (
          <MetricInput
            label={<Text>RIR</Text>}
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
        <View className="flex-1 gap-2">
          {/* Toggles */}
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => toggleNotes(set.id)}
              className={`rounded-full px-2 py-px border ${set.notes.enabled ? "bg-red-400" : ""}`}
            >
              <Text>Notas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleDropSets(set.id)}
              className={`rounded-full px-2 py-px border ${set.dropSets?.length > 0 ? "bg-red-400" : ""}`}
            >
              <Text>Drop Sets</Text>
            </TouchableOpacity>

            {/* Partial Reps */}
            <TouchableOpacity
              onPress={() => openPartialRepsModal(set)}
              className={`rounded-full flex-row items-center px-2 py-px border ${hasPartialReps ? "bg-red-400" : ""}`}
            >
              {hasPartialReps && (
                <TouchableOpacity onPress={() => deletePartialReps(set.id)}>
                  <Ionicons name="close" size={12} className="mr-2" />
                </TouchableOpacity>
              )}
              {hasPartialReps ? <PartialReps set={set} /> : <Text>Parciales</Text>}
            </TouchableOpacity>
          </View>

          {/* Notes input */}
          {set.notes.enabled && (
            <TextInput
              value={set.notes.text}
              className="border"
              placeholder="Nota para esta serie..."
              selectTextOnFocus
              onChangeText={(text) => updateNotes(set.id, text)}
            />
          )}

          {/* Drop Sets */}
          {set?.dropSets?.length > 0 && (
            <View className="gap-1">
              <DropSets set={set} advancedMode={advancedMode} />
              <TouchableOpacity onPress={() => addDropSet(set.id)}>
                <Text>Agregar Drop Set</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() =>
            addSet(set.exerciseId, {
              weight: set.weight.value,
              reps: set.reps.value,
              rir: set.rir.value,
            })
          }
        >
          <Text>Duplicar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteStep(set.id)}>
          <Text>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
