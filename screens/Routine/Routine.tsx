import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { useRoutinesStore } from "@/stores/RoutinesStore";

import RoutineSteps from "./components/RoutineSteps";

export default function Routine({ navigation, route }: any) {
  const { routineId } = route.params;

  const insets = useSafeAreaInsets();

  const routines = useRoutinesStore((state) => state.routines);
  const deleteRoutine = useRoutinesStore((state) => state.deleteRoutine);

  const routine = routines.find((r) => r.id === routineId);

  useEffect(() => {
    navigation.setOptions({ title: routine?.name });
  }, [routine?.name, navigation]);

  const handleDeleteRoutine = () => {
    deleteRoutine(routineId);
    navigation.goBack();
  };

  if (!routine) return null;

  return (
    <View className="flex-1 flex-grow bg-white" style={{ paddingBottom: insets.bottom }}>
      <ScrollView className="flex-1 p-3">
        <RoutineSteps routine={routine} />
      </ScrollView>

      {/* Buttons */}
      <View className="flex-row items-center gap-2 px-3 mb-3">
        <TouchableOpacity
          onPress={() => navigation.navigate("editRoutine", { routineId })}
          className="flex-1 p-3 bg-neutral-800 rounded-lg"
        >
          <Text className="text-center text-white font-medium">Editar rutina</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-2 px-3 mb-3">
        <TouchableOpacity onPress={handleDeleteRoutine} className="flex-1 p-3 border-red-400 border rounded-lg">
          <Text className="text-center text-red-500 font-medium">Eliminar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 p-3 bg-red-400 rounded-lg">
          <Text className="text-center text-white font-bold">Iniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
