import { View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { useRoutinesStore } from "@/stores/RoutinesStore";

import { randomId } from "@/utils/random";
import colors from "tailwindcss/colors";

export default function CreateRoutineScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const routines = useRoutinesStore((state) => state.routines);
  const setRoutines = useRoutinesStore((state) => state.setRoutines);

  const [routine, setRoutine] = useState<{ name: string; type: "weekly" | "individual" }>({
    name: "",
    type: "weekly",
  });

  useEffect(() => {
    navigation.setOptions({
      title: "Crear rutina",
    });
  }, [navigation]);

  const updateRoutine = (field: "name" | "type", value: string) => {
    setRoutine((prev) => ({ ...prev, [field]: value }));
  };

  // const createRoutine = () => {
  //   const routineId = randomId();
  //   const newRoutine = { id: routineId, name: routine.name || "Nueva Rutina", type: routine.type, steps: [] };
  //   setRoutines([newRoutine, ...routines]);
  //   const state = navigation.getState();
  //   const routes = [
  //     ...state.routes.slice(0, -1),
  //     { name: "routine", params: { routineId } },
  //     { name: "editRoutine", params: { routineId } },
  //   ];

  //   navigation.reset({
  //     ...state,
  //     routes,
  //     index: routes.length - 1,
  //   });
  // };

  const createRoutine = () => {
    const routineId = randomId();
    const newRoutine = { id: routineId, name: routine.name || "Nueva Rutina", type: routine.type, steps: [] };
    setRoutines([newRoutine, ...routines]);
    const state = navigation.getState();
    const routes = [
      ...state.routes.slice(0, -1),
      { name: "routine", params: { routineId } },
      { name: "editRoutine", params: { routineId } },
    ];

    navigation.reset({
      ...state,
      routes,
      index: routes.length - 1,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      <TextInput
        value={routine.name}
        autoFocus
        onChangeText={(value) => updateRoutine("name", value)}
        className="text-2xl font-bold p-6"
        placeholder="Nombre de la rutina"
        cursorColor={colors.neutral[400]}
      />

      <View className="p-3 pt-0 gap-3">
        <Text className="ml-3">Elegi el tipo de rutina</Text>

        <TouchableOpacity
          onPress={() => updateRoutine("type", "weekly")}
          className={`w-full h-24 border gap-1 justify-center px-6 rounded-2xl ${routine.type === "weekly" ? "bg-neutral-200 border-neutral-400" : "border-neutral-300"}`}
        >
          <Text className={`text-lg font-medium ${routine.type === "weekly" ? "text-black" : ""}`}>Rutina Semanal</Text>
          <Text className="text-sm text-neutral-600">Rutina de varios dias que se repetira semanalmente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => updateRoutine("type", "individual")}
          className={`w-full h-24 border gap-1 justify-center px-6 rounded-2xl ${routine.type === "individual" ? "bg-neutral-200 border-neutral-400" : "border-neutral-300"}`}
        >
          <Text className={`text-lg font-medium ${routine.type === "individual" ? "text-black" : ""}`}>
            Rutina Individual
          </Text>
          <Text className="text-sm text-neutral-600">Una sola rutina que se repite durante toda la semana</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={createRoutine} className="p-6 bg-black rounded-md">
          <Text className="text-center text-white font-bold text-xl">Crear Rutina</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
