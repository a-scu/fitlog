import { View, Text } from "react-native";
import React from "react";
import DropSet from "./DropSet";

export default function DropSets({ set }: any) {
  return (
    <View>
      <Text>Drop Sets</Text>

      {set.dropSets.map((dropSet: any, index: number) => (
        <DropSet key={dropSet.id || index} index={index} dropSet={dropSet} set={set} />
      ))}
    </View>
  );
}
