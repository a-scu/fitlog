import React from "react";
import { View } from "react-native";

import { DropSet as DropSetType } from "@/types/Routine";

import DropSet from "./DropSet";

export default function DropSets({ dropSets }: { dropSets: DropSetType[] }) {
  return (
    <View className="gap-1">
      {dropSets.map((dropSet: DropSetType, index: number) => (
        <DropSet key={dropSet.id} dropSet={dropSet} index={index} />
      ))}
    </View>
  );
}
