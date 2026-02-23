import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text } from "react-native";

const Tab = createMaterialTopTabNavigator();

// Example screens for Material Top Tabs
function Tab1Screen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Tab 1 Content</Text>
    </View>
  );
}

function Tab2Screen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Tab 2 Content</Text>
    </View>
  );
}

// Example Material Top Tabs Navigator
export default function MaterialTopTabsExample() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Tab1" component={Tab1Screen} />
      <Tab.Screen name="Tab2" component={Tab2Screen} />
    </Tab.Navigator>
  );
}



