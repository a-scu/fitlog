import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import Header from "@/components/Header";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { randomId } from "@/utils/random";

export default function HomeScreen({ navigation }) {
  const routines = useRoutinesStore((state) => state.routines);
  const setRoutines = useRoutinesStore((state) => state.setRoutines);

  console.log("Routines", routines);

  const createRoutine = () => {
    const routineId = randomId();
    const newRoutine = { id: routineId, name: "Nueva Rutina", steps: [] };
    setRoutines([newRoutine, ...routines]);
    navigation.navigate("editRoutine", { routineId });
  };

  const deleteRoutines = () => {
    setRoutines([]);
  };

  return (
    <View className="flex-1 bg-white">
      <Header hideBack title="Crear rutina" />

      <ScrollView className="flex-1" contentContainerClassName="p-3">
        <TouchableOpacity
          onPress={createRoutine}
          className="w-full h-24 border mb-2 border-neutral-400 justify-center p-3 rounded-2xl"
        >
          <Text>Crear rutina</Text>
        </TouchableOpacity>

        {/* Rutinas */}

        <TouchableOpacity onPress={deleteRoutines}>
          <Text>Delete routines</Text>
        </TouchableOpacity>

        <View className="gap-2">
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              onPress={() => navigation.navigate("routine", { routineId: routine.id })}
              className="w-full h-24 border border-neutral-400 justify-center p-3 rounded-2xl"
            >
              <Text>{routine.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
