import React from "react";
import { View, TouchableOpacity, useWindowDimensions, Animated } from "react-native";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";

export default function CustomTopTabBar({ state, descriptors, navigation, position }: MaterialTopTabBarProps) {
  const { width } = useWindowDimensions();
  const TAB_WIDTH = width / state.routes.length;

  const indicatorStyle = {
    transform: [
      {
        translateX: position.interpolate({
          inputRange: [0, state.routes.length - 1],
          outputRange: [0, TAB_WIDTH * (state.routes.length - 1)],
        }),
      },
    ],
  };

  return (
    <View className="border-b border-neutral-100 bg-white">
      <View className="flex-row h-14 items-center">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const opacity = position.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.35, 1, 0.35],
            extrapolate: "clamp",
          });

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{ width: TAB_WIDTH }}
              className="items-center py-3"
            >
              <Animated.Text style={{ opacity }} className="text-lg font-medium text-neutral-800">
                {label as string}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Indicator */}
      <Animated.View style={[{ width: TAB_WIDTH }, indicatorStyle]} className="h-px absolute -bottom-px bg-black" />
    </View>
  );
}
