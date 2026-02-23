import { EXERCISE_GIFS } from "@/assets/images/exercises";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageProps } from "expo-image";
import { StyleProp, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const ExerciseGif = ({ exerciseId, className, style, ...rest }: { exerciseId: string; className?: string; style?: StyleProp<ViewStyle>; rest?: ImageProps }) => {
  const opacity = useSharedValue(1);
  const animatedImageStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className={`overflow-hidden items-center justify-center bg-neutral-50 rounded-md ${className}`} style={style}>
      <Ionicons name="image-outline" size={32} className="!text-neutral-200 absolute" />

      <AnimatedImage
        source={EXERCISE_GIFS[exerciseId]}
        style={[{ width: "100%", height: "100%", backgroundColor: "#fff" }, animatedImageStyle]}
        contentFit="contain"
        onError={() => {
          opacity.value = 0;
        }}
        {...rest}
      />
    </View>
  );
};

export default ExerciseGif;
