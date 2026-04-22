import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

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
    <View className="flex-1">
      <View className="flex-row items-center justify-between">
        {label}
        {advancedMode && (
          <TouchableOpacity onPress={onToggleRange}>
            {metric.isRange ? <Text>MIN-MAX</Text> : <Text>FIJO</Text>}
          </TouchableOpacity>
        )}
      </View>

      {metric.isRange ? (
        <View className="flex-row gap-1">
          <TextInput value={metric.min} onChangeText={onUpdateMin} className="border flex-1" keyboardType="numeric" />
          <TextInput value={metric.max} onChangeText={onUpdateMax} className="border flex-1" keyboardType="numeric" />
        </View>
      ) : (
        <TextInput value={metric.value} onChangeText={onUpdateValue} className="border flex-1" keyboardType="numeric" />
      )}
    </View>
  );
};

export default MetricInput;
