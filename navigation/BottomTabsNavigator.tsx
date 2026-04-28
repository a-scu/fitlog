import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";

import ExercisesScreen from "@/screens/ExercisesScreen";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DashboardScreen from "@/screens/Dashboard/DashboardScreen";
import { capitalize } from "@/lib/utils";
import SettingsScreen from "@/screens/Settings/SettingsScreen";
import Header from "@/components/Header";
import ProgramsScreen from "@/screens/ProgramsScreen";
import WorkspacesScreen from "@/screens/Workspaces/WorkspacesScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        header: (props) => <Header hideBack title={props.options.title} />,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="dashboard" component={DashboardScreen} options={{ headerShown: true, title: "Dashboard" }} />
      <Tab.Screen name="programs" component={ProgramsScreen} />
      <Tab.Screen name="workspaces" component={WorkspacesScreen} options={{ headerShown: true, title: "Workspaces" }} />
      <Tab.Screen name="settings" component={SettingsScreen} options={{ headerShown: true, title: "Configuración" }} />
    </Tab.Navigator>
  );
}

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={{ paddingBottom: insets.bottom }} className="bg-white border-t border-neutral-100">
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

          let iconName: any = "dashboard-outline";
          if (route.name === "dashboard") iconName = isFocused ? "grid-outline" : "grid-outline";
          if (route.name === "programs") iconName = isFocused ? "calendar-outline" : "calendar-outline";
          if (route.name === "workspaces") iconName = isFocused ? "folder-open-outline" : "folder-open-outline";
          if (route.name === "settings") iconName = isFocused ? "options-outline" : "options-outline";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              className="items-center justify-center flex-1"
              activeOpacity={0.7}
            >
              <View className={`p-1 rounded-xl items-center justify-center`}>
                <Ionicons name={iconName} size={24} className={isFocused ? "!text-red-400" : "!text-neutral-400"} />
              </View>
              <Text
                style={{ includeFontPadding: false }}
                className={`text-[10px] mt-1 font-semibold ${isFocused ? "text-red-400" : "text-neutral-400"}`}
              >
                {route.name === "dashboard" ? "Dashboard" : capitalize(route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
