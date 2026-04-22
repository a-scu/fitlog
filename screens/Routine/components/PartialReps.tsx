import React from "react";
import { View, Text } from "react-native";

import { PartialReps as PartialRepsType } from "@/types/Routine";

export default function PartialReps({ partialReps }: { partialReps: PartialRepsType }) {
  return (
    <View className="flex-row gap-2 mb-2 border p-2 border-neutral-400 rounded">
      {partialReps.isRange ? (
        // Range: min - max
        <View className="flex-row items-center">
          <Text>
            Partial reps:{" "}
            {partialReps.min} -{" "}
            {partialReps.max === "10" ? "Fallo" : partialReps.max}
          </Text>
        </View>
      ) : (
        // Fixed value
        <Text>
          Partial reps: {partialReps.value === "10" ? "Fallo" : partialReps.value}
        </Text>
      )}

      {/* Rom */}
      {partialReps.rom && <Text>ROM: {partialReps.rom}</Text>}
    </View>
  );
}
