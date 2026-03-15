import { ScrollView, Text, View } from "react-native";

const COLORS = ["#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];

export default function Colors() {
  return (
    <View className="mb-8 w-full">
      <View className="mb-5 px-3 items-center flex-1 flex-row">
        <Text className="text-lg font-bold text-neutral-800">Colores</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="grow gap-2 px-3">
        {COLORS.map((color, index) => (
          <View key={index} className="size-9 rounded-full" style={{ backgroundColor: color }} />
        ))}
      </ScrollView>
    </View>
  );
}
