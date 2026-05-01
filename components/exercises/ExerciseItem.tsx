import { memo, useCallback } from "react";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { capitalize } from "@/lib/utils";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import ExerciseGif from "../ExerciseGif";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ExerciseItem = ({
  exercise,
  selected,
  onToggle,
}: {
  exercise: any;
  selected?: boolean;
  onToggle?: () => void;
}) => {
  const navigation = useNavigation<any>();

  const { equipments = [], gifUrl, name, targetMuscles = [] } = exercise;

  const opacity = useSharedValue(1);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      navigation.navigate("exercise", { exercise });
    }
  }, [navigation, exercise, onToggle]);

  return (
    <Pressable
      onPress={handlePress}
      className={`flex flex-row flex-1 h-32 justify-between gap-2 pr-2 overflow-hidden rounded-lg ${selected ? "bg-red-50 border border-red-400" : "bg-white border-neutral-100"}`}
    >
      <View className="h-full bg-white px-2 pt-2">
        <ExerciseGif exerciseId={exercise.exerciseId} className="size-24" />
      </View>

      <View className="flex flex-col flex-1 py-3">
        <Text className="mb-1 text-neutral-800 text-sm font-medium">{capitalize(name)}</Text>

        <View className="flex flex-row flex-wrap items-center gap-1 mb-1">
          {targetMuscles.map((muscle: string) => (
            <Text key={muscle} className="text-xs border border-red-200 px-1 py-px rounded text-red-400">
              {capitalize(muscle)}
            </Text>
          ))}
        </View>

        <Text className="self-start text-xs text-neutral-400">{capitalize(equipments.join(", "))}</Text>
      </View>
    </Pressable>
  );
};

export default memo(ExerciseItem);
