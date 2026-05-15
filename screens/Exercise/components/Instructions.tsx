import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { formatInstruction } from "@/lib/utils";
import { ExerciseTranslations } from "@/types/Workout";

const Instructions = ({ children: instructions }: { children: ExerciseTranslations["instructions"] }) => {
  const { t } = useTranslation();

  return (
    <View className="px-3">
      {/* Instructions */}
      {instructions && instructions.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-3 dark:text-white">{t("screens.exercise.instructions")}</Text>

          <View className="gap-4">
            {instructions.map((instruction: string, index: number) => (
              <View key={instruction} className="flex flex-row justify-start items-center">
                <View className="size-6 rounded-full border border-neutral-200 dark:border-neutral-700 items-center justify-center aspect-square mr-3">
                  <Text className="text-xs font-regular text-neutral-400 dark:text-neutral-500">{index + 1}</Text>
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-300 leading-6 border-neutral-200/75 dark:border-neutral-800 flex-1 rounded-md">
                  {formatInstruction(instruction)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default Instructions;
