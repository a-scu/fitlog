import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { randomId } from "@/utils/random";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateRoutineScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const routines = useRoutinesStore((s) => s.routines);
  const addRoutine = useRoutinesStore((state) => state.addRoutine);
  const updateWorkspace = useWorkspacesStore((s) => s.updateWorkspace);

  const [routine, setRoutine] = useState({
    name: "",
  });

  useEffect(() => {
    navigation.setOptions({ title: "Crear rutina" });
  }, []);

  const handleCreateRoutine = () => {
    const { workspaceId } = route.params || {};
    const newRoutineId = randomId();
    const newRoutine = {
      id: newRoutineId,
      name: routine.name || `Rutina ${routines.length + 1}`,
      createdAt: new Date().toISOString(),
      days: Array.from({ length: 7 }, (_, i) => ({
        id: randomId(),
        dayIndex: i as any,
        title: "",
        description: "",
        isRestDay: true,
        workoutId: null,
      })),
    };

    addRoutine(newRoutine);

    if (workspaceId) {
      updateWorkspace(workspaceId, "routineId", newRoutineId);
    }

    navigation.replace("routine", { routineId: newRoutineId });
  };

  return (
    <View className="bg-white flex-1" style={{ paddingBottom: insets.bottom }}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} contentContainerClassName="py-3 gap-6">
        <View className="gap-1 px-3">
          <Text className="text-neutral-500 font-medium mb-1">Nombre de la rutina</Text>
          <TextInput
            value={routine.name}
            onChangeText={(value) => setRoutine({ name: value })}
            className="border border-neutral-200 rounded-2xl p-4 text-lg"
            placeholder="Ej: Empuje Tracción Piernas"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleCreateRoutine}
        className="bg-black items-center justify-center p-8 mx-3 mb-3 rounded-xl"
      >
        <Text className="text-center text-lg font-semibold text-white">Crear rutina</Text>
      </TouchableOpacity>
    </View>
  );
}
