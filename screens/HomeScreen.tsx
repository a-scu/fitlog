import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import Header from "@/components/Header";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { randomId } from "@/utils/random";
import { Ionicons } from "@expo/vector-icons";
import { getRoutineMuscles } from "@/utils/routineMuscles";

export default function HomeScreen({ navigation }) {
  const routines = useRoutinesStore((state) => state.routines);
  const setRoutines = useRoutinesStore((state) => state.setRoutines);

  console.log("Routines", routines);

  const handleCreateRoutine = () => {
    navigation.navigate("createRoutine");
  };

  const deleteRoutines = () => {
    setRoutines([]);
  };

  return (
    <View className="flex-1 bg-white">
      <Header hideBack title="Inicio" />

      <ScrollView className="flex-1" contentContainerClassName="p-3">
        <TouchableOpacity
          onPress={handleCreateRoutine}
          className="w-full h-24 border justify-between gap-2 border-neutral-400 flex-row items-center px-6 rounded-2xl"
        >
          <Text className="text-xl font-bold">Crear rutina</Text>
          <Ionicons name="arrow-forward-outline" size={24} color="black" />
        </TouchableOpacity>

        {/* Rutinas */}

        <TouchableOpacity onPress={deleteRoutines} className="p-6">
          <Text>Delete routines</Text>
        </TouchableOpacity>

        <View className="gap-2">
          {routines.map((routine) => {
            const onPress = () => navigation.navigate("routine", { routineId: routine.id });

            const routineSets = routine.steps.filter((s) => s.type !== "rest");
            const { target } = getRoutineMuscles(routine);

            console.log(target);

            return (
              <TouchableOpacity
                key={routine.id}
                onPress={onPress}
                className="w-full h-24 border border-neutral-400 p-6 gap-2 rounded-2xl flex-row items-center"
              >
                <View className="flex-1">
                  <Text className="font-bold text-lg">{routine.name}</Text>
                  {target.length > 0 && (
                    <Text className="text-neutral-500 text-sm" numberOfLines={1}>
                      {target.join(", ")}
                    </Text>
                  )}
                </View>

                <Text className="font-medium">
                  {routineSets.length} {routineSets.length !== 1 ? "sets" : "set"}
                </Text>

                <Ionicons name="chevron-forward" size={20} color="#a3a3a3" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
