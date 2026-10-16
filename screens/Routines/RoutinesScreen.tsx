import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Routine } from "@/types/Routine";

import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useModalStore } from "@/stores/ModalStore";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

import { randomId } from "@/utils/random";
import { Ionicons } from "@expo/vector-icons";

export default function RoutinesScreen({ navigation }: any) {
  const routines = useRoutinesStore((state) => state.routines);
  const deleteAllRoutines = useRoutinesStore(
    (state) => state.deleteAllRoutines,
  );
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
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <ScrollView contentContainerClassName="p-4 gap-4 flex-1">
        <TouchableOpacity
          onPress={handleCreateRoutine}
          className="p-6 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl items-center justify-center flex-row gap-2"
        >
          <Ionicons name="add-circle-outline" size={24} color="#10b981" />
          <Text className="text-neutral-900 dark:text-white font-bold text-lg">
            Crear Rutina
          </Text>
        </TouchableOpacity>

        {routines.length > 0 ? (
          <TouchableOpacity
            onPress={handleDeleteAll}
            className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl flex-row items-center justify-center gap-2"
          >
            <Ionicons name="trash-bin-outline" size={18} color="#ef4444" />
            <Text className="text-red-600 dark:text-red-500 font-medium">
              Eliminar todas las rutinas
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="items-center py-6">
            <Text className="text-neutral-400 dark:text-neutral-500">
              No hay rutinas guardadas
            </Text>
          </View>
        )}

        <View className="gap-3">
          {routines.map((routine, index) => (
            <RoutineItem key={routine.id} index={index} routine={routine} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const RoutineItem = ({
  routine,
  index,
}: {
  routine: Routine;
  index: number;
}) => {
  const navigation = useNavigation();

  const deleteRoutine = useRoutinesStore((state) => state.deleteRoutine);
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const showModal = useModalStore((s) => s.showModal);

  const handleNavigate = () => {
    navigation.navigate("routine", { routineId: routine.id });
  };

  const handleDelete = () => {
    const activeInWorkspaces = workspaces.filter(
      (w) => w.routineId === routine.id,
    );

    if (activeInWorkspaces.length > 0) {
      const workspaceNames = activeInWorkspaces
        .map((w) => w.name || "Sin nombre")
        .join(", ");
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
      <TouchableOpacity
        onPress={handleNavigate}
        className="p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl flex-1 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-1">
          <Text className="font-bold text-neutral-900 dark:text-white text-base mb-1">
            {routine.name || `Rutina ${index + 1}`}
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">
            {routine.days.length} Dias
          </Text>
          <Text
            className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-2"
            numberOfLines={1}
          >
            {workspaces.filter((w) => w.routineId === routine.id).length > 0
              ? `En uso en: ${workspaces
                  .filter((w) => w.routineId === routine.id)
                  .map((w) => w.name || "Sin nombre")
                  .join(", ")}`
              : "No se está usando en ningún workspace"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDelete}
        className="p-4 border border-red-200 dark:border-red-900/30 bg-white dark:bg-neutral-800 rounded-2xl items-center justify-center shadow-sm"
      >
        <Ionicons name="trash-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};
