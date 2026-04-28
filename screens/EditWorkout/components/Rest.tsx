import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Rest as RestType } from "@/types/Workout";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";

export default function Rest({ rest }: { rest: RestType }) {
  const deleteStep = useWorkoutsStore((state) => state.deleteStep);
  const updateRestDuration = useWorkoutsStore((state) => state.updateRestDuration);

  return (
    <View className="flex-row items-center justify-between p-3 bg-neutral-100 rounded mb-2">
      <View className="flex-row items-center gap-2">
        <Ionicons name="time-outline" size={20} className="!text-neutral-500" />
        <Text className="text-neutral-600 font-medium">Descanso</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <TextInput
          className="bg-white px-3 py-1 rounded-md w-16 text-center font-bold"
          keyboardType="numeric"
          value={rest.duration?.toString()}
          onChangeText={(text) => updateRestDuration(rest.id, parseInt(text) || 0)}
        />
        <Text className="text-neutral-500 text-sm">s</Text>
        <TouchableOpacity onPress={() => deleteStep(rest.id)} className="ml-2">
          <Ionicons name="trash-outline" size={20} className="!text-red-400" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
