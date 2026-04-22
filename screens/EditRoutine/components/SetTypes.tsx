import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { Set } from "@/types/Routine";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { SET_TYPES } from "@/constants/SetTypes";

export default function SetTypes({ set }: { set: Set }) {
  const updateSetField = useRoutinesStore((s) => s.updateSetField);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="" contentContainerClassName="px-2 gap-1">
      {SET_TYPES.map((setType) => {
        const isSelected = set.type === setType.id;

        if (setType.id === "custom")
          return (
            <TextInput
              key={set.id}
              placeholder="Tipo de set..."
              value={set.customTypeName || "Custom"}
              onChangeText={(text) => updateSetField(set.id, "customTypeName", text)}
              onFocus={() => updateSetField(set.id, "type", "custom")}
              selectTextOnFocus
              style={{
                includeFontPadding: false,
                textAlignVertical: "center",
                backgroundColor: isSelected ? setType.color[500] : "transparent",
              }}
              className={`${isSelected ? "text-white" : "text-neutral-400"} px-2 py-0.5 text-xs h-4 rounded-full`}
            />
          );

        return (
          <TouchableOpacity
            key={setType.id}
            className={`px-2 h-4 items-center justify-center rounded-full`}
            style={{
              backgroundColor: isSelected ? setType.color[500] : "transparent",
            }}
            onPress={() => {
              updateSetField(set.id, "type", setType.id);
            }}
          >
            <Text className={`text-xs ${isSelected ? "text-white" : "text-neutral-400"}`}>
              {setType.id === "custom" && isSelected && set.customTypeName ? set.customTypeName : setType.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
