import { View, Text } from "react-native";

import { Step } from "@/types/Workout";

import Rest from "./Rest";
import Set from "./Set";

export default function Steps({ steps }: { steps: Step[] }) {
  if (!steps.length)
    return (
      <View className="p-8 border border-neutral-200 rounded-xl items-center justify-center">
        <Text className="text-neutral-400 text-sm">No hay ejercicios</Text>
      </View>
    );

  return (
    <View className="gap-3">
      {steps.map((step: any, index: number) =>
        step.type === "rest" ? <Rest key={step.id} rest={step} /> : <Set key={step.id} set={step} index={index} />,
      )}
    </View>
  );
}
