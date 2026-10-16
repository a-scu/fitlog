import React from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import RoutinesScreen from "@/screens/Routines/RoutinesScreen";
import WorkoutsScreen from "@/screens/Workouts/WorkoutsScreen";
import CustomTopTabBar from "@/components/CustomTopTabBar";

const Tab = createMaterialTopTabNavigator();

export default function ProgramsScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
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
