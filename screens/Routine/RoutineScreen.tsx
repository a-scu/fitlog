import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";

import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useModalStore } from "@/stores/useModalStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { SelectRoutineModal } from "@/components/modals/SelectRoutineModal";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import Days from "./components/Days";

import { randomId } from "@/utils/random";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

export default function RoutineScreen({ navigation, route }: any) {
  const { routineId } = route.params;

  const insets = useSafeAreaInsets();

  const routines = useRoutinesStore((s) => s.routines);
  const updateRoutine = useRoutinesStore((s) => s.updateRoutine);
  const deleteRoutine = useRoutinesStore((s) => s.deleteRoutine);

  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const workspacesUsingRoutine = workspaces.filter((w) => w.routineId === routineId);
  const isUsedInMultipleWorkspaces = workspacesUsingRoutine.length > 1;

  const routine = routines.find((r) => r.id === routineId);

  useEffect(() => {
    navigation.setOptions({
      title: "Editar rutina",
    });
  }, [navigation]);

  const showModal = useModalStore((s) => s.showModal);

  const handleImportRoutine = () => {
    showModal({
      snapPoints: ["60%", "90%"],
      content: (
        <SelectRoutineModal
          excludeId={routineId}
          templateOnly={true}
          onSelectRoutine={(selectedRoutine, asTemplate) => {
            const newDays = selectedRoutine.days.map((day) => ({
              ...day,
              id: randomId(),
            }));
            updateRoutine(routineId, "days", newDays);
            updateRoutine(routineId, "name", `${selectedRoutine.name} (Copia)`);
          }}
        />
      ),
    });
  };

  const handleDeleteRoutine = () => {
    const activeInWorkspaces = workspaces.filter((w) => w.routineId === routineId);

    const workspaceNames = activeInWorkspaces.map((w) => w.name || "Sin nombre").join(", ");

    showModal({
      snapPoints: ["45%"],
      content: (
        <ConfirmationModal
          title="¿Eliminar rutina activa?"
          description={
            activeInWorkspaces.length > 0
              ? `Esta rutina está activa en los siguientes workspaces: ${workspaceNames}. Si la eliminas, los workspaces quedarán sin rutina.`
              : "¿Estas seguro de que quieres eliminar esta rutina?"
          }
          onConfirm={() => {
            navigation.goBack();
            deleteRoutine(routineId);
          }}
          confirmText="Eliminar"
          type="danger"
        />
      ),
    });
  };

  if (!routine) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-neutral-400 font-medium">Cargando rutina...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} contentContainerClassName="py-3 gap-6">
        {isUsedInMultipleWorkspaces && (
          <View className="bg-yellow-100 p-4 border-b border-yellow-200 -mt-3">
            <Text className="text-yellow-800 font-medium">
              Esta rutina está siendo usada en otros workspaces. Si la modificas, se modificará en todos. Ten cuidado.
            </Text>
          </View>
        )}
        {/* Routine Name */}
        <View className="gap-3 px-3">
          <View>
            <Text className="text-neutral-500 font-medium mb-1">Nombre de la rutina</Text>
            <TextInput
              value={routine.name}
              onChangeText={(value) => updateRoutine(routineId, "name", value)}
              className="border border-neutral-200 rounded-2xl p-4 text-lg"
              placeholder="Ej: Mi rutina semanal"
            />
            <Text className="text-neutral-400 text-xs mt-2">
              {workspacesUsingRoutine.length > 0
                ? `Esta rutina se usa en: ${workspacesUsingRoutine.map((w) => w.name || "Sin nombre").join(", ")}`
                : "Esta rutina no está asignada a ningún workspace"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleImportRoutine}
            className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <Ionicons name="download-outline" size={20} color={colors.neutral[500]} />
            <Text className="text-neutral-500 font-medium">Importar rutina como plantilla</Text>
          </TouchableOpacity>
        </View>

        {/* Days */}
        <Days routineId={routineId} days={routine.days} />

        <TouchableOpacity
          onPress={handleDeleteRoutine}
          className="p-5 border-red-500 border rounded-xl flex-row gap-3 items-center justify-center mx-3"
        >
          <Ionicons name="trash-bin-outline" className="!text-lg" color={colors.red[500]} />
          <Text className="text-red-500 text-center text-lg">Eliminar rutina</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
