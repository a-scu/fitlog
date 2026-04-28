import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

interface MetricInputProps {
  label: React.ReactNode;
  metric: { value: string; min: string; max: string; isRange: boolean };
  onUpdateValue: (text: string) => void;
  onUpdateMin: (text: string) => void;
  onUpdateMax: (text: string) => void;
  onToggleRange: () => void;
}

const MetricInput = ({ label, metric, onUpdateValue, onUpdateMin, onUpdateMax, onToggleRange }: MetricInputProps) => {
  const advancedMode = useGlobalSettingsStore((state) => state.advancedMode);

  return (
    <View className="flex-1 gap-0.5">
      <View className="flex-row items-center justify-between px-1.5">
        <Text className="text-xs text-neutral-500">{label}</Text>
        {advancedMode && (
          <TouchableOpacity onPress={onToggleRange}>
            <View className="flex-row gap-0.5 items-center">
              <Ionicons name="repeat-outline" className="!text-neutral-500 text-xs leading-none" />
              <Text className="text-xs text-neutral-500">{metric.isRange ? "MIN-MAX" : "FIJO"}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {metric.isRange ? (
        <View className="flex-row gap-1">
          <TextInput
            value={metric.min}
            onChangeText={onUpdateMin}
            className="border flex-1 border-neutral-400 rounded-md px-2 text-center"
            keyboardType="numeric"
            // enterKeyHint="next"
            cursorColor={colors.neutral[400]}
          />
          <TextInput
            value={metric.max}
            onChangeText={onUpdateMax}
            className="border flex-1 border-neutral-400 rounded-md px-2 text-center"
            keyboardType="numeric"
            // enterKeyHint="next"
            cursorColor={colors.neutral[400]}
          />
        </View>
      ) : (
        <TextInput
          value={metric.value}
          onChangeText={onUpdateValue}
          className="border flex-1 border-neutral-400 rounded-md px-2 text-center"
          keyboardType="numeric"
          // enterKeyHint="next"
          cursorColor={colors.neutral[400]}
        />
      )}
    </View>
  );
};

export default MetricInput;
