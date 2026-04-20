import { View, Text } from "react-native";
import React from "react";
import DropSetItem from "./DropSetItem";

export default function DropSets({
  set,
}: any) {
  return (
    <View>
      <Text>Drop Sets</Text>

      {set.dropSets.map((dropSet: any, index: number) => (
        <DropSetItem
          key={dropSet.id || index}
          index={index}
          dropSet={dropSet}
          set={set}
        />
      ))}
    </View>
  );
}
