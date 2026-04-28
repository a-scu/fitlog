import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { Set } from "@/types/Workout";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { SET_TYPES } from "@/constants/SetTypes";
import colors from "tailwindcss/colors";

export default function SetTypes({ set }: { set: Set }) {
  const updateSetField = useWorkoutsStore((s) => s.updateSetField);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-2" contentContainerClassName="">
      {SET_TYPES.map((setType) => {
        const isSelected = set.type === setType.id;

        // if (setType.id === "custom")
        //   return (
        //     <TextInput
        //       key={set.id}
        //       placeholder="Tipo de set..."
        //       value={set.customTypeName || "Custom"}
        //       onChangeText={(text) => updateSetField(set.id, "customTypeName", text)}
        //       onFocus={() => updateSetField(set.id, "type", "custom")}
        //       selectTextOnFocus
        //       className={`px-2 py-0.5 text-xs h-4 rounded-full ${isSelected ? "font-bold" : ""}`}
        //       style={{
        //         includeFontPadding: false,
        //         textAlignVertical: "center",
        //         color: isSelected ? setType.color[500] : colors.neutral[500],
        //       }}
        //     />
        //   );

        return (
          <TouchableOpacity
            key={setType.id}
            className={`px-2 rounded-full`}
            onPress={() => {
              updateSetField(set.id, "type", setType.id);
            }}
          >
            <Text
              className={`text-center text-sm ${isSelected ? "font-medium" : ""}`}
              style={{ color: isSelected ? setType.color[400] : colors.neutral[400] }}
            >
              {setType.id === "custom" && isSelected && set.customTypeName ? set.customTypeName : setType.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
