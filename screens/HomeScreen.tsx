import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";

import { randomId } from "@/utils/random";

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const getPersonalWorkspace = useWorkspacesStore((state) => state.getPersonalWorkspace);
  const personalWorkspace = getPersonalWorkspace();

  const routines = useRoutinesStore((state) => state.routines);

  const { routineId } = personalWorkspace;
  const routine = routines.find((r) => r.id === routineId);

  console.log("Personal routine id:", routineId);

  if (!routineId || !routine) {
    const handleCreateRoutine = () => {
      navigation.navigate("createRoutine", { workspaceId: personalWorkspace.id });
    };

    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <ScrollView className="flex-1" contentContainerClassName="p-3">
          <TouchableOpacity onPress={handleCreateRoutine} className="p-6 border rounded-md">
            <Text>Crear rutina</Text>
          </TouchableOpacity>

          <Text>Aun no creaste ninguna rutina</Text>
        </ScrollView>
      </View>
    );
  }

  const today = new Date().getDay();
  const adjustedDay = (today + 6) % 7; // Map 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
  const todaysWorkout = routine.days.find((d) => d.dayIndex === adjustedDay);

  console.log("Today's Workout", todaysWorkout);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="p-3"></ScrollView>
    </View>
  );
}
