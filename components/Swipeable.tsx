import { useState } from "react";
import { View, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

const SWIPE_CONFIG = {
  ACTIONS_WIDTH: screenWidth - 96 - 12,
  SNAP_DISTANCE_THRESHOLD: 0.8,
  SNAP_VELOCITY_THRESHOLD: -200,
  ANIMATION_CONFIG: { duration: 150 },
};

interface SwipeableProps {
  children: React.ReactNode;
  renderLeftActions?: React.ReactNode;
  renderRightActions?: React.ReactNode;
  config?: typeof SWIPE_CONFIG;
}

const Swipeable = ({ children, renderLeftActions, renderRightActions, config = SWIPE_CONFIG }: SwipeableProps) => {
  const translateX = useSharedValue(0);
  const context = useSharedValue(0);
  const [isMounted, setIsMounted] = useState(false);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      context.value = translateX.value;
    })
    .onUpdate((e) => {
      const x = e.translationX + context.value;
      if (Math.abs(x) > 0 && !isMounted) {
        runOnJS(setIsMounted)(true);
      }
      const minX = renderRightActions ? -config.ACTIONS_WIDTH : 0;
      const maxX = renderLeftActions ? config.ACTIONS_WIDTH : 0;
      translateX.value = Math.max(minX, Math.min(maxX, x));
    })
    .onEnd((e) => {
      const isSwipingLeft = translateX.value < 0;
      const threshold = config.ACTIONS_WIDTH * config.SNAP_DISTANCE_THRESHOLD;

      let finalValue = 0;
      if (isSwipingLeft && renderRightActions) {
        const shouldSnap = translateX.value < -threshold || e.velocityX < config.SNAP_VELOCITY_THRESHOLD;
        finalValue = shouldSnap ? -config.ACTIONS_WIDTH : 0;
      } else if (!isSwipingLeft && renderLeftActions) {
        const shouldSnap = translateX.value > threshold || e.velocityX > -config.SNAP_VELOCITY_THRESHOLD;
        finalValue = shouldSnap ? config.ACTIONS_WIDTH : 0;
      }

      translateX.value = withTiming(finalValue, config.ANIMATION_CONFIG, (finished) => {
        if (finished && finalValue === 0) {
          runOnJS(setIsMounted)(false);
        }
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const absTranslateX = Math.abs(translateX.value);

    const shadowOpacity = interpolate(absTranslateX, [0, 200, config.ACTIONS_WIDTH - 40, config.ACTIONS_WIDTH], [0, 0.25, 0.25, 0], "clamp");

    const elevation = interpolate(absTranslateX, [0, 200, config.ACTIONS_WIDTH - 40, config.ACTIONS_WIDTH], [0, 10, 10, 0], "clamp");

    return {
      transform: [{ translateX: translateX.value }],
      backgroundColor: "white",
      shadowColor: "#00000080",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: shadowOpacity,
      shadowRadius: 5,
      elevation: elevation,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View className="overflow-hidden">
        {isMounted && renderLeftActions && (
          <View className="absolute top-0 bottom-0 left-0" style={{ width: config.ACTIONS_WIDTH }}>
            {renderLeftActions}
          </View>
        )}
        {isMounted && renderRightActions && (
          <View className="absolute top-0 bottom-0 right-0" style={{ width: config.ACTIONS_WIDTH }}>
            {renderRightActions}
          </View>
        )}
        <Animated.View style={[animatedStyle]}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
};

export default Swipeable;
