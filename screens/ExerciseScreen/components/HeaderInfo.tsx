import { View, Text } from "react-native";
import { capitalize } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import ExerciseGif from "@/components/ExerciseGif";

export default function HeaderInfo({ exercise }: { exercise: any }) {
  const { t } = useTranslation();
  const targetMuscle = exercise.targetMuscles && exercise.targetMuscles.length > 0 ? exercise.targetMuscles[0] : "";

  return (
    <View className="mb-7 flex-row px-3 w-full items-center gap-4 py-4">
      {/* GIF */}
      <ExerciseGif exerciseId={exercise.exerciseId} className="size-24" />

      <View className="flex-row gap-4 flex-1">
        <View className="flex-[1.25]">
          <Text className="mb-0.5 text-sm font-semibold text-neutral-600">Musculos afectados</Text>

          <Text>
            {/* Target Muscle */}
            <Text className="text-xs font-medium text-red-400">{capitalize(targetMuscle)},</Text>
            {/* Secondary Muscles */}
            <Text className="text-neutral-400 text-xs">
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && " " + exercise.secondaryMuscles.map((muscle: string) => capitalize(muscle)).join(", ")}
            </Text>
          </Text>
        </View>

        {/* Equipment */}
        <View className="flex-1">
          <Text className="mb-0.5 text-sm font-semibold text-neutral-600">{t("screens.exercise.equipment")}</Text>
          <Text className="text-xs text-neutral-400">
            {exercise.equipments && exercise.equipments.length > 0 ? capitalize(exercise.equipments.join(", ")) : t("screens.exercise.none")}
          </Text>
        </View>
      </View>
    </View>
  );
}
