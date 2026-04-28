import React from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RoutinesScreen from "@/screens/Routines/RoutinesScreen";
import WorkoutsScreen from "@/screens/Workouts/WorkoutsScreen";
import CustomTopTabBar from "@/components/CustomTopTabBar";

const Tab = createMaterialTopTabNavigator();

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTopTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="Rutinas" component={RoutinesScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      </Tab.Navigator>
    </View>
  );
}
