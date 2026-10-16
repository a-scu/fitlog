import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";

import { randomId } from "@/utils/random";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateWorkspaceScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();

  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const addWorkspace = useWorkspacesStore((state) => state.addWorkspace);

  const [workspace, setWorkspace] = useState({
    name: "",
  });

  useEffect(() => {
    navigation.setOptions({ title: "Crear alumno" });
  }, []);

  const updateWorkspace = (field: string, value: any) => {
    setWorkspace((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateWorkspace = () => {
    const newWorkspace = {
      id: randomId(),
      name: workspace.name || `Alumno ${workspaces.length + 1}`,
      routineId: "",
      notes: [],
      isShared: false,
      createdAt: new Date().toISOString(),
      coachId: null,
      athleteId: null,
    };

    addWorkspace(newWorkspace);

    navigation.replace("workspace", { workspaceId: newWorkspace.id });
  };

  return (
    <View
      className="bg-white dark:bg-neutral-950 flex-1"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="py-3 gap-6"
      >
        {/* Workspace Name */}
        <View className="gap-1 px-3">
          <Text className="text-neutral-500 dark:text-neutral-400 font-medium mb-1">
            Nombre del alumno
          </Text>
          <TextInput
            value={workspace.name}
            onChangeText={(value) => updateWorkspace("name", value)}
            className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl p-4 text-lg text-neutral-900 dark:text-white"
            placeholder="Nombre del atleta o cliente"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleCreateWorkspace}
        className="bg-black dark:bg-white items-center justify-center p-5 mx-3 mb-3 rounded-2xl"
      >
        <Text className="text-center text-lg font-bold text-white dark:text-black">
          Crear alumno
        </Text>
      </TouchableOpacity>
    </View>
  );
}
