import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import colors from "tailwindcss/colors";
import PlannedSet from "./PlannedSet";
import { Step } from "@/types/Workout";

export default function PlannedSteps({ plannedSteps }: { plannedSteps: Step[] }) {
  return (
    <View className="gap-3">
      {plannedSteps.map((step, index) => {
        if (step.type === "rest") return <PlannedRest key={step.id} duration={step.duration} />;

        const sets = plannedSteps.filter((step) => step.type !== "rest");
        const setIndex = sets.indexOf(step);

        return <PlannedSet key={step.id} set={step} index={setIndex} />;
      })}
    </View>
  );
}

const PlannedRest = ({ duration }: { duration: number }) => {
  return (
    <View className="bg-blue-50/30 dark:bg-blue-950/10 border border-dashed border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl flex-row items-center gap-3">
      <Ionicons name="timer-outline" size={20} color={colors.blue[500]} />
      <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">Descanso: {duration}s</Text>
    </View>
  );
};
