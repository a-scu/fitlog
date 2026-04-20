import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { Keyboard, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import Swipeable from "@/components/Swipeable";
import { capitalize } from "@/lib/utils";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ExerciseItem = ({
  exercise,
  routineId,
}: {
  exercise: any;
  routineId: string;
}) => {
  const navigation = useNavigation<any>();

  const { equipments = [], gifUrl, name, targetMuscles = [] } = exercise;

  const [reps, setReps] = useState("8");
  const [sets, setSets] = useState("2");

  const opacity = useSharedValue(1);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    navigation.navigate("exercise", { exercise, routineId });
  }, [navigation, exercise]);

  return (
    <Pressable
      onPress={handlePress}
      className="flex flex-row flex-1 justify-between bg-white gap-3 px-3 py-2"
    >
      <View className="overflow-hidden size-24 items-center justify-center bg-neutral-50 rounded-md">
        <Ionicons
          name="image-outline"
          size={32}
          className="!text-neutral-200 absolute"
        />

        <AnimatedImage
          source={{ uri: gifUrl }}
          style={[
            { width: "100%", height: "100%", backgroundColor: "#fff" },
            animatedImageStyle,
          ]}
          contentFit="contain"
          onError={() => {
            opacity.value = 0;
          }}
        />
      </View>

      <View className="flex flex-col flex-1 py-2">
        <Text className="mb-1 text-neutral-800 text-sm font-medium">
          {capitalize(name)}
        </Text>

        <View className="flex flex-row flex-wrap items-center gap-1 mb-1">
          {targetMuscles.map((muscle: string) => (
            <Text
              key={muscle}
              className="text-xs border border-red-200 px-1 py-px rounded text-red-400"
            >
              {capitalize(muscle)}
            </Text>
          ))}
        </View>

        <Text className="self-start text-xs text-neutral-400">
          {capitalize(equipments.join(", "))}
        </Text>
      </View>
    </Pressable>
  );
};

export default memo(ExerciseItem);
