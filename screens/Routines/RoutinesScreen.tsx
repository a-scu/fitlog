import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Routine } from "@/types/Routine";

import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useModalStore } from "@/stores/useModalStore";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

import { randomId } from "@/utils/random";
import { Ionicons } from "@expo/vector-icons";

export default function RoutinesScreen({ navigation }: any) {
  const routines = useRoutinesStore((state) => state.routines);
  const deleteAllRoutines = useRoutinesStore((state) => state.deleteAllRoutines);
  const showModal = useModalStore((s) => s.showModal);

  console.log("Routines", routines);

  const handleCreateRoutine = () => {
    navigation.navigate("createRoutine");
  };

  const handleDeleteAll = () => {
    showModal({
      snapPoints: ["40%"],
      content: (
        <ConfirmationModal
          title="¿Eliminar todas las rutinas?"
          description="Esta acción no se puede deshacer. Se eliminarán todas tus rutinas guardadas."
          onConfirm={deleteAllRoutines}
          confirmText="Eliminar todas"
          type="danger"
        />
      ),
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-3 gap-3">
        <TouchableOpacity onPress={handleCreateRoutine} className="p-6 border rounded-md">
          <Text>Crear rutina</Text>
        </TouchableOpacity>

        {routines.length > 0 ? (
          <TouchableOpacity onPress={handleDeleteAll} className="border p-3 rounded-lg">
            <Text className="text-center">Eliminar todas las rutinas</Text>
          </TouchableOpacity>
        ) : (
          <Text>No hay rutinas</Text>
        )}

        {routines.map((routine, index) => (
          <RoutineItem key={routine.id} index={index} routine={routine} />
        ))}
      </ScrollView>
    </View>
  );
}

const RoutineItem = ({ routine, index }: { routine: Routine; index: number }) => {
  const navigation = useNavigation();

  const deleteRoutine = useRoutinesStore((state) => state.deleteRoutine);
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const showModal = useModalStore((s) => s.showModal);

  const handleNavigate = () => {
    navigation.navigate("routine", { routineId: routine.id });
  };

  const handleDelete = () => {
    const activeInWorkspaces = workspaces.filter((w) => w.routineId === routine.id);

    if (activeInWorkspaces.length > 0) {
      const workspaceNames = activeInWorkspaces.map((w) => w.name || "Sin nombre").join(", ");
      showModal({
        snapPoints: ["45%"],
        content: (
          <ConfirmationModal
            title="¿Eliminar rutina activa?"
            description={`Esta rutina está activa en los siguientes workspaces: ${workspaceNames}. Si la eliminas, los workspaces quedarán sin rutina.`}
            onConfirm={() => deleteRoutine(routine.id)}
            confirmText="Eliminar"
            type="danger"
          />
        ),
      });
    } else {
      deleteRoutine(routine.id);
    }
  };

  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity onPress={handleNavigate} className="p-3 border rounded-md flex-1">
        <Text className="font-bold">{routine.name || `Rutina ${index + 1}`}</Text>
        <Text className="text-neutral-500 text-xs">{routine.days.length} Dias</Text>
        <Text className="text-neutral-400 text-[10px] mt-1" numberOfLines={1}>
          {workspaces.filter((w) => w.routineId === routine.id).length > 0
            ? `En uso en: ${workspaces
                .filter((w) => w.routineId === routine.id)
                .map((w) => w.name || "Sin nombre")
                .join(", ")}`
            : "No se está usando en ningún workspace"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} className="p-3 border border-red-200 rounded-md">
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
};
