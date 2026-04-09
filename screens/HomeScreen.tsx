import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import Header from "@/components/Header";
import { useRoutines } from "@/stores/RoutinesStore";
import { randomId } from "@/utils/random";

export default function HomeScreen({ navigation }) {
  const routines = useRoutines((state) => state.routines);
  const setRoutines = useRoutines((state) => state.setRoutines);

  console.log("Routines", routines);

  const createRoutine = () => {
    const newRoutine = {
      id: randomId(),
      name: "Rutina " + (routines.length + 1),
      steps: [],
    };
    setRoutines([...routines, newRoutine]);
    navigation.navigate("exercises", { routineId: newRoutine.id });
  };

  return (
    <View className="flex-1 bg-white">
      <Header hideBack title="Crear rutina" />

      <ScrollView className="flex-1" contentContainerClassName="p-3">
        <TouchableOpacity
          onPress={createRoutine}
          className="w-full h-24 border border-neutral-400 justify-center p-3 rounded-2xl"
        >
          <Text>Crear rutina</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
