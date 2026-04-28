import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Rest as RestType } from "@/types/Workout";

export default function Rest({ data }: { data: RestType }) {
  return (
    <View className="flex-row bg-neutral-200 items-center gap-1 rounded p-2 mb-2">
      <Ionicons name="time-outline" size={12} className="" />
      <Text>Descanso {data.duration}s</Text>
    </View>
  );
}
