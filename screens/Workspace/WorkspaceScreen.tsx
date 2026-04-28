import { View, Text } from "react-native";
import { useEffect } from "react";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import OverviewTab from "./components/OverviewTab";
import NotesTab from "./components/NotesTab";
import CustomTopTabBar from "@/components/CustomTopTabBar";

const Tab = createMaterialTopTabNavigator();

export default function WorkspaceScreen({ navigation, route }: any) {
  const { workspaceId, initialTab } = route.params;

  const insets = useSafeAreaInsets();

  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const workspace = workspaces.find((w) => w.id === workspaceId);

  useEffect(() => {
    if (workspace) {
      navigation.setOptions({ title: workspace.name || "Workspace sin nombre" });
    }
  }, [workspace?.name, navigation]);

  if (!workspace) return <Text>Hubo un problema, no se encontró el workspace</Text>;

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      <Tab.Navigator
        initialRouteName={initialTab}
        tabBar={(props) => <CustomTopTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="overview" options={{ title: "Inicio" }}>
          {() => <OverviewTab workspace={workspace} />}
        </Tab.Screen>
        <Tab.Screen name="notes" options={{ title: "Notas" }}>
          {() => <NotesTab workspace={workspace} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
