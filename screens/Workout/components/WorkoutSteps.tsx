import React from "react";
import { Image } from "expo-image";
import { View, Text } from "react-native";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import { Workout, Step, Set } from "@/types/Workout";

import Rest from "./Rest";
import PartialReps from "./PartialReps";

import EXERCISES from "@/assets/data/exercises.json";
import { SET_TYPES } from "@/constants/SetTypes";

import { capitalize } from "@/lib/utils";
import DropSets from "./DropSets";
import Notes from "./Notes";

/* Formats a Metric field for display */
function formatMetric(metric: { value: string; min: string; max: string; isRange: boolean }, suffix = "") {
  if (metric.isRange) {
    const minVal = metric.min || "-";
    const maxVal = metric.max || "-";
    return `${minVal}–${maxVal}${suffix}`;
  }
  return metric.value ? `${metric.value}${suffix}` : "-";
}

export default function WorkoutSteps({ workout }: { workout: Workout }) {
  const weightUnit = useGlobalSettingsStore((state) => state.weightUnit);

  return (
    <View>
      {workout.steps.map((step: Step, index: number) => {
        if (step.type === "rest") {
          return <Rest key={step.id} data={step} />;
        }

        const exercise = EXERCISES.find((e) => e.exerciseId === step.exerciseId);
        const setType = SET_TYPES.find((st) => st.id === step.type);

        const hasPartialReps = step.partialReps.isRange
          ? step.partialReps.min && step.partialReps.max
          : step.partialReps.value;

        return (
          <View key={step.id} className="bg-neutral-200 rounded p-3 mb-2">
            {/* Set Header */}
            <View className="flex-row gap-2 mb-2">
              {/* Gif */}
              <View className="rounded-md size-12 items-center overflow-hidden">
                <Image source={{ uri: exercise?.gifUrl }} style={{ width: "100%", height: "100%" }} />
              </View>

              {/* Serie Number | Set Type | Exercise Name */}
              <View className="justify-center">
                <View className="flex-row gap-2 items-center">
                  {/* Serie Number */}
                  <Text className="font-medium text-neutral-600">Serie {index + 1}</Text>
                  {/* Set Type */}
                  <Text className={`py-px text-xs px-1.5 self-start rounded ${setType?.selectedColor}`}>
                    {setType?.label}
                  </Text>
                </View>

                {/* Exercise Name */}
                <Text className="text-lg font-semibold">{capitalize(exercise?.name)}</Text>
              </View>
            </View>

            {/* Main Metrics */}
            <View className="flex-row gap-1 w-full mb-2">
              {/* Weight */}
              <View className="bg-neutral-400 rounded p-2 flex-1">
                <Text className="text-center text-sm font-medium">
                  {formatMetric(step.weight)} {weightUnit}
                </Text>
              </View>

              {/* Reps */}
              <View className="bg-neutral-400 rounded p-2 flex-1">
                <Text className="text-center text-sm font-medium">{formatMetric(step.reps, " Reps")}</Text>
              </View>

              {/* RIR */}
              <View className="bg-neutral-400 rounded p-2 flex-1">
                <Text className="text-center text-sm font-medium">RIR {formatMetric(step.rir)}</Text>
              </View>
            </View>

            {/* Partial reps */}
            {hasPartialReps && <PartialReps partialReps={step.partialReps} />}

            {/* Drop sets */}
            {step.dropSets.length > 0 && <DropSets dropSets={step.dropSets} />}

            {/* Notes */}
            {step.notes.enabled && <Notes>{step.notes.text}</Notes>}
          </View>
        );
      })}
    </View>
  );
}
