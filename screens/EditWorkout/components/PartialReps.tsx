import { Text, View } from "react-native";

interface PartialRepsProps {
  set: any;
}

export default function PartialReps({ set }: PartialRepsProps) {
  const pr = set.partialReps;
  return (
    <View className="flex-row">
      <Text>
        Parciales{" "}
        {pr.isRange
          ? `${pr.min == 10 ? "Fallo" : pr.min}-${pr.max == 10 ? "Fallo" : pr.max}`
          : pr.value == 10
          ? "Fallo"
          : pr.value}
      </Text>
      {pr.rom && <Text className="ml-2">ROM {pr.rom}</Text>}
    </View>
  );
}
