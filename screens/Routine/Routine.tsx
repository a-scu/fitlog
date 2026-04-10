import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRoutines } from "@/stores/RoutinesStore";

export default function Routine({ navigation, route }) {
  const { routineId } = route.params;

  const routines = useRoutines((state) => state.routines);
  const setRoutines = useRoutines((state) => state.setRoutines);

  const routine = routines.find((r) => r.id === routineId);

  const deleteRoutine = () => {
    const filteredRoutines = routines.filter((r) => r.id !== routineId);
    setRoutines(filteredRoutines);
    navigation.goBack();
  };

  return (
    <View>
      <Text>{routine?.name}</Text>

      <TouchableOpacity onPress={deleteRoutine}>
        <Text>Eliminar rutina</Text>
      </TouchableOpacity>
    </View>
  );
}
