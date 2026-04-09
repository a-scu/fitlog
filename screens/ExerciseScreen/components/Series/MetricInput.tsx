import { useGlobalRoutinesSettings } from "@/stores/GlobalRoutinesSettings";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";

const MetricInput = ({
  label,
  value,
  minValue,
  maxValue,
  rangeEnabled,
  onUpdateValue,
  onUpdateMinValue,
  onUpdateMaxValue,
  onToggleMinMax,
}: any) => {
  const advancedMode = useGlobalRoutinesSettings((state) => state.advancedMode);

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between">
        {label}

        {advancedMode && (
          <TouchableOpacity onPress={onToggleMinMax}>
            {rangeEnabled ? <Text>MIN-MAX</Text> : <Text>FIJO</Text>}
          </TouchableOpacity>
        )}
      </View>

      {rangeEnabled ? (
        <View className="flex-row gap-1">
          <TextInput
            value={minValue}
            onChangeText={onUpdateMinValue}
            className="border flex-1"
            keyboardType="numeric"
          />
          <TextInput
            value={maxValue}
            onChangeText={onUpdateMaxValue}
            className="border flex-1"
            keyboardType="numeric"
          />
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onUpdateValue}
          className="border flex-1"
          keyboardType="numeric"
        />
      )}
    </View>
  );
};

export default MetricInput;
