import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { Keyboard, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import Swipeable from "@/components/Swipeable";
import { capitalize } from "@/lib/utils";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ExerciseItem = ({ exercise }: { exercise: any }) => {
  const navigation = useNavigation<any>();

  const { equipments = [], gifUrl, name, targetMuscles = [] } = exercise;

  const [reps, setReps] = useState("8");
  const [sets, setSets] = useState("2");

  const opacity = useSharedValue(1);

  const animatedImageStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handlePress = useCallback(() => {
    navigation.navigate("exercise", { exercise });
  }, [navigation, exercise]);

  return (
    <Swipeable renderLeftActions={<LeftActions exercise={exercise} reps={reps} setReps={setReps} sets={sets} setSets={setSets} />}>
      <Pressable onPress={handlePress} className="flex flex-row justify-between bg-white gap-4 px-3 py-2">
        <View className="overflow-hidden size-24 items-center justify-center bg-neutral-50 rounded-md">
          <Ionicons name="image-outline" size={32} className="!text-neutral-200 absolute" />

          <AnimatedImage
            source={{ uri: gifUrl }}
            style={[{ width: "100%", height: "100%", backgroundColor: "#fff" }, animatedImageStyle]}
            contentFit="contain"
            onError={() => {
              opacity.value = 0;
            }}
          />
        </View>

        <View className="flex flex-col flex-1 py-2">
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
    </Swipeable>
  );
};

const LeftActions = ({
  exercise,
  reps,
  setReps,
  sets,
  setSets,
}: {
  exercise: any;
  reps: string;
  setReps: (v: string | ((prev: string) => string)) => void;
  sets: string;
  setSets: (v: string | ((prev: string) => string)) => void;
}) => {
  const handleAdd = (value = 1, type: "reps" | "sets") => {
    if (type === "reps") {
      setReps((prev) => ((parseInt(prev) || 0) + value).toString());
    } else {
      setSets((prev) => ((parseInt(prev) || 0) + value).toString());
    }
  };
  const handleRemove = (type: "reps" | "sets") => {
    if (type === "reps") {
      setReps((prev) => Math.max(1, (parseInt(prev) || 0) - 1).toString());
    } else {
      setSets((prev) => Math.max(1, (parseInt(prev) || 0) - 1).toString());
    }
  };
  const handleReset = (type: "reps" | "sets") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (type === "reps") {
      setReps("1");
    } else {
      setSets("1");
    }
  };
  const repsInputRef = useRef<TextInput>(null);
  const setsInputRef = useRef<TextInput>(null);
  const intervalRef = useRef<any>(null);
  const isRepeatingRef = useRef(false);

  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener("keyboardDidHide", () => {
      repsInputRef.current?.blur();
      setsInputRef.current?.blur();
    });
    return () => {
      keyboardSubscription.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRepeating = (type: "reps" | "sets") => {
    if (intervalRef.current) return;
    isRepeatingRef.current = false;
    intervalRef.current = setInterval(() => {
      const setter = type === "reps" ? setReps : setSets;
      setter((prev) => {
        const current = parseInt(prev) || 0;
        if (type === "reps") {
          return (Math.floor(current / 4) + 1) * 4 + "";
        } else {
          return (Math.floor(current / 2) + 1) * 2 + "";
        }
      });
      isRepeatingRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }, 300);
  };

  const stopRepeating = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleChangeText = (v: string, type: "reps" | "sets") => {
    const clean = v.replace(/[^0-9]/g, "");
    const value = clean === "" ? "1" : parseInt(clean).toString();
    if (type === "reps") setReps(value);
    else setSets(value);
  };

  return (
    <View className="flex-row gap-2 h-full w-full pl-3 items-center">
      {/* Series */}

      <View className="gap-px">
        <Text className="text-xs font-medium text-neutral-600 mb-1">Series</Text>

        <View className="flex-row items-center gap-1">
          <View className="flex-row gap-0.5">
            <TouchableOpacity
              onPress={() => {
                handleRemove("sets");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onLongPress={() => handleReset("sets")}
              delayLongPress={300}
            >
              <View className="size-10 bg-neutral-200 rounded-sm justify-center items-center">
                <Ionicons name="remove-outline" size={20} className="!text-neutral-400" />
              </View>
            </TouchableOpacity>

            <TextInput
              ref={setsInputRef}
              className="size-10 border border-neutral-200 rounded-sm justify-center items-center text-neutral-800 text-center text-base"
              style={{ includeFontPadding: false, textAlignVertical: "center", textAlign: "center", padding: 0 }}
              value={sets}
              onChangeText={(v) => handleChangeText(v, "sets")}
              keyboardType="numeric"
              selectTextOnFocus
            />

            <TouchableOpacity
              onPress={() => {
                if (!isRepeatingRef.current) {
                  handleAdd(1, "sets");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              onPressIn={() => startRepeating("sets")}
              onPressOut={stopRepeating}
            >
              <View className="size-10 bg-neutral-200 rounded-sm justify-center items-center">
                <Ionicons name="add-outline" size={20} className="!text-neutral-400" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Repetitions */}

      <View className="gap-px">
        <Text className="text-xs font-medium text-neutral-600 mb-1">Repeticiones</Text>

        <View className="flex-row items-center gap-1">
          <View className="flex-row gap-0.5">
            <TouchableOpacity
              onPress={() => {
                handleRemove("reps");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onLongPress={() => handleReset("reps")}
              delayLongPress={300}
            >
              <View className="size-10 bg-neutral-200 rounded-sm justify-center items-center">
                <Ionicons name="remove-outline" size={20} className="!text-neutral-400" />
              </View>
            </TouchableOpacity>

            <TextInput
              ref={repsInputRef}
              className="size-10 border border-neutral-200 rounded-sm justify-center items-center text-neutral-800 text-center text-base"
              style={{ includeFontPadding: false, textAlignVertical: "center", textAlign: "center", padding: 0 }}
              value={reps}
              onChangeText={(v) => handleChangeText(v, "reps")}
              keyboardType="numeric"
              selectTextOnFocus
            />

            <TouchableOpacity
              onPress={() => {
                if (!isRepeatingRef.current) {
                  handleAdd(1, "reps");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              onPressIn={() => startRepeating("reps")}
              onPressOut={stopRepeating}
            >
              <View className="size-10 bg-neutral-200 rounded-sm justify-center items-center">
                <Ionicons name="add-outline" size={20} className="!text-neutral-400" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <Text className="text-xs font-medium text-transparent mb-1"></Text>
        <TouchableOpacity>
          <View className="h-10 border border-green-400 bg-green-50 rounded-sm justify-center items-center flex-row gap-1 mr-px">
            <Ionicons name="checkmark-outline" size={20} className="!text-green-400" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(ExerciseItem);
