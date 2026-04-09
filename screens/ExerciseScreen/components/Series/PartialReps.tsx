import { Text, View } from "react-native";

interface PartialRepsProps {
  set: any;
}

export default function PartialReps({ set }: PartialRepsProps) {
  return (
    <View className="flex-row">
      <Text className="">
        Parciales{" "}
        {set.partialReps.count
          ? set.partialReps.count == 10
            ? "Fallo"
            : set.partialReps.count
          : `${set.partialReps.min == 10 ? "Fallo" : set.partialReps.min}-${set.partialReps.max}`}
      </Text>
      {set.partialReps.rom && (
        <Text className="ml-2">ROM {set.partialReps.rom}</Text>
      )}
    </View>
  );
}
