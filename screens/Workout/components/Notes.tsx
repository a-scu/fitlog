import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Notes({ children: notes }: { children: string }) {
  return (
    <View className="gap-1 mt-1 bg-neutral-300 p-2 rounded">
      {/* Label */}
      <View className="flex-row gap-1 items-center">
        <Ionicons name="chatbox-outline" size={10} className="!text-neutral-500" />
        <Text className="text-neutral-500 text-sm font-medium">Notas</Text>
      </View>

      {/* Notes */}
      <Text>{notes || "..."}</Text>
    </View>
  );
}
