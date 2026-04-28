import { View, Text, TouchableOpacity } from "react-native";
import DropSet from "./DropSet";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

export default function DropSets({ set }: any) {
  const addDropSet = useWorkoutsStore((s) => s.addDropSet);

  return (
    <View className="gap-2 p-3 pt-2 rounded-md">
      <Text className="text-sm text-neutral-600 font-medium">Drop Sets</Text>

      {set.dropSets.map((dropSet: any, index: number) => (
        <DropSet key={dropSet.id || index} index={index} dropSet={dropSet} set={set} />
      ))}

      <TouchableOpacity
        onPress={() => addDropSet(set.id)}
        className="border border-neutral-200 flex-row items-center justify-center gap-1 rounded-md p-2"
      >
        <Ionicons name="add-outline" className="!text-sm !leading-none" color={colors.neutral[600]} />
        <Text className="text-center text-sm text-neutral-600">Agregar Drop Set</Text>
      </TouchableOpacity>
    </View>
  );
}
