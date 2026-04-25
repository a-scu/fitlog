import { View, Text } from "react-native";

import { Step } from "@/types/Routine";

import Rest from "./Rest";
import Set from "./Set";

export default function Steps({ steps }: { steps: Step[] }) {
  if (!steps.length)
    return (
      <View>
        <Text>No steps</Text>
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
