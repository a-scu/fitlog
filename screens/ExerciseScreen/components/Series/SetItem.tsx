import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";

import SetTypes from "./SetTypes";
import MetricInput from "./MetricInput";

import { useGlobalRoutinesSettings } from "@/stores/GlobalRoutinesSettings";
import DropSets from "./DropSets";
import PartialReps from "./PartialReps";
import { Ionicons } from "@expo/vector-icons";

export default function SetItem({
  index,
  set,
  updateSetField,
  deleteSet,
  duplicateSet,
  openPartialRepsModal,
  addDropSet,
  toggleDropSets,
  updateDropSetField,
  deleteDropSet,
  openDropSetPartialRepsModal,
  deletePartialReps,
  toggleNotes,
  updateNotes,
}: any) {
  const weightUnit = useGlobalRoutinesSettings((state) => state.weightUnit);
  const advancedMode = useGlobalRoutinesSettings((state) => state.advancedMode);

  return (
    <View className="gap-1 border bg-neutral-200 rounded-xl p-2">
      {/* Header */}

      <View className="flex-row px-2">
        <Text>SERIE {index + 1}</Text>
        <SetTypes set={set} updateSetField={updateSetField} />
      </View>

      {/* Row */}

      <View className="flex-row gap-1 px-1 flex-1">
        {/* Weight */}
        <MetricInput
          label={<Text>PESO ({weightUnit})</Text>}
          value={set.weight}
          minValue={set.minWeight}
          maxValue={set.maxWeight}
          rangeEnabled={set.weightIsRange}
          onUpdateValue={(text: string) =>
            updateSetField(set.id, "weight", text)
          }
          onUpdateMinValue={(text: string) =>
            updateSetField(set.id, "minWeight", text)
          }
          onUpdateMaxValue={(text: string) =>
            updateSetField(set.id, "maxWeight", text)
          }
          onToggleMinMax={() =>
            updateSetField(set.id, "weightIsRange", !set.weightIsRange)
          }
        />

        {/* Reps */}
        <MetricInput
          label={<Text>REPES</Text>}
          value={set.reps}
          minValue={set.minReps}
          maxValue={set.maxReps}
          rangeEnabled={set.repsIsRange}
          onUpdateValue={(text: string) => updateSetField(set.id, "reps", text)}
          onUpdateMinValue={(text: string) =>
            updateSetField(set.id, "minReps", text)
          }
          onUpdateMaxValue={(text: string) =>
            updateSetField(set.id, "maxReps", text)
          }
          onToggleMinMax={() =>
            updateSetField(set.id, "repsIsRange", !set.repsIsRange)
          }
        />

        {/* Rir */}
        <MetricInput
          label={<Text>RIR</Text>}
          value={set.rir}
          minValue={set.minRir}
          maxValue={set.maxRir}
          rangeEnabled={set.rirIsRange}
          onUpdateValue={(text: string) => updateSetField(set.id, "rir", text)}
          onUpdateMinValue={(text: string) =>
            updateSetField(set.id, "minRir", text)
          }
          onUpdateMaxValue={(text: string) =>
            updateSetField(set.id, "maxRir", text)
          }
          onToggleMinMax={() =>
            updateSetField(set.id, "rirIsRange", !set.rirIsRange)
          }
        />
      </View>

      {/* Advanced Options */}

      {advancedMode && (
        <View className="flex-1 gap-2">
          {/* Toggles */}

          <View className="flex-row">
            <TouchableOpacity
              onPress={toggleNotes}
              className={`rounded-full px-2 py-px border ${set.notes.enabled ? "bg-red-400" : ""}`}
            >
              <Text>Notas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleDropSets}
              className={`rounded-full px-2 py-px border ${set.dropSets?.length > 0 ? "bg-red-400" : ""}`}
            >
              <Text>Drop Sets</Text>
            </TouchableOpacity>

            {/* Partial Reps */}
            <TouchableOpacity
              onPress={() => openPartialRepsModal(set)}
              className={`rounded-full flex-row items-center px-2 py-px border ${set.partialReps?.count > 0 ? "bg-red-400" : ""}`}
            >
              {set.partialReps?.count != 0 && (
                <TouchableOpacity onPress={() => deletePartialReps()}>
                  <Ionicons name="close" size={12} className="mr-2" />
                </TouchableOpacity>
              )}

              {set.partialReps?.count != 0 ? (
                <PartialReps set={set} />
              ) : (
                <Text>Parciales</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes */}
          {set.notes.enabled && (
            <TextInput
              value={set.notes.text}
              className="border"
              autoFocus
              placeholder="Nota para esta serie..."
              selectTextOnFocus
              onChangeText={(text) => updateNotes(text)}
            />
          )}

          {/* Rest Pause */}

          {/* Descansos entre dropsets */}

          {/* Drop Sets */}
          {set?.dropSets?.length > 0 && (
            <View className="gap-1">
              <DropSets
                set={set}
                advancedMode={advancedMode}
                updateDropSetField={updateDropSetField}
                deleteDropSet={deleteDropSet}
                openDropSetPartialRepsModal={openDropSetPartialRepsModal}
                deletePartialReps={deletePartialReps}
              />

              <TouchableOpacity onPress={addDropSet}>
                <Text>Agregar Drop Set</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View className="flex-row gap-2">
        <TouchableOpacity onPress={duplicateSet}>
          <Text>Duplicar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteSet}>
          <Text>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
