import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";

import ExercisesScreen from "@/screens/ExercisesScreen";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "@/screens/HomeScreen";
import { capitalize } from "@/lib/utils";
import SettingsScreen from "@/screens/Settings/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-white border-t border-neutral-100"
    >
      <View className="flex-row items-center justify-around py-4">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
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

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          let iconName: any = "home-outline";
          if (route.name === "exercises")
            iconName = isFocused ? "fitness" : "fitness-outline";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              className="items-center justify-center flex-1"
              activeOpacity={0.7}
            >
              <View className={`p-1 rounded-xl items-center justify-center`}>
                <Ionicons
                  name={iconName}
                  size={24}
                  className={isFocused ? "!text-red-400" : "!text-neutral-400"}
                />
              </View>
              <Text
                style={{ includeFontPadding: false }}
                className={`text-[10px] mt-1 font-semibold ${isFocused ? "text-red-400" : "text-neutral-400"}`}
              >
                {t(`screens.tabs.${route.name.toLowerCase()}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
