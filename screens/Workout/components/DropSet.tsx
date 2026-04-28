import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import { DropSet as DropSetType } from "@/types/Workout";

import PartialReps from "./PartialReps";

function formatMetric(metric: { value: string; min: string; max: string; isRange: boolean }, suffix = "") {
  if (metric.isRange) {
    return `${metric.min || "-"}–${metric.max || "-"}${suffix}`;
  }
  return metric.value ? `${metric.value}${suffix}` : "-";
}

export default function DropSet({ dropSet, index }: { dropSet: DropSetType; index: number }) {
  const weightUnit = useGlobalSettingsStore((state) => state.weightUnit);

  const hasPartialReps = dropSet.partialReps.isRange
    ? dropSet.partialReps.min && dropSet.partialReps.max
    : dropSet.partialReps.value;

  return (
    <View key={dropSet.id} className="w-full">
      <View className="flex-row w-full items-center gap-2">
        <Ionicons name="return-down-forward-outline" size={16} />

        <View className="bg-neutral-300 gap-1 rounded flex-1 p-2">
          {/* Dropset Number */}
          <Text className="text-sm">Dropset {index + 1}</Text>

          {/* Main Metrics */}
          <View className="flex-row gap-1">
            <View className="bg-neutral-400 rounded p-2 flex-1">
              <Text className="text-center text-sm font-medium">
                {formatMetric(dropSet.weight)} {weightUnit}
              </Text>
            </View>
            <View className="bg-neutral-400 rounded p-2 flex-1">
              <Text className="text-center text-sm font-medium">{formatMetric(dropSet.reps, " Reps")}</Text>
            </View>
            <View className="bg-neutral-400 rounded p-2 flex-1">
              <Text className="text-center text-sm font-medium">RIR {formatMetric(dropSet.rir)}</Text>
            </View>
          </View>

          {/* Partial Reps */}
          {hasPartialReps && (
            <View className="mt-1">
              <PartialReps partialReps={dropSet.partialReps} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
