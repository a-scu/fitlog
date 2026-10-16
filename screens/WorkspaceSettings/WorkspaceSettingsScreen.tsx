import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { SelectRoutineModal } from "@/components/modals/SelectRoutineModal";
import RoutineOverview from "@/components/RoutineOverview";
import { useModalStore } from "@/stores/ModalStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { Routine } from "@/types/Routine";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import colors from "tailwindcss/colors";

export default function WorkspaceSettingsScreen({ navigation, route }: any) {
  const workspaceId = route?.params?.workspaceId;

  const isPersonalWorkspace = !workspaceId;

  const workspace = isPersonalWorkspace
    ? useWorkspacesStore((s) => s.personalWorkspace)
    : useWorkspacesStore((s) => s.workspaces.find((w) => w.id === workspaceId));

  const deleteWorkspace = useWorkspacesStore((state) => state.deleteWorkspace);

  if (!workspace)
    return <Text>Hubo un error inesperado, no se encontró el alumno</Text>;

  const showModal = useModalStore((s) => s.showModal);

  useEffect(() => {
    navigation.setOptions({
      title: isPersonalWorkspace
        ? "Routine settings"
        : `${workspace.name} / Settings`,
    });
  }, []);

  const handleDeleteWorkspace = () => {
    showModal({
      snapPoints: ["40%"],
      content: (
        <ConfirmationModal
          title="¿Eliminar alumno compartido?"
          description={`Este espacio está compartido con un alumno. Si lo eliminas, perderá el acceso a sus rutinas.`}
          onConfirm={() => deleteWorkspace(workspace.id)}
          confirmText="Eliminar"
          type="danger"
        />
      ),
    });
  };

  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);
  const updatePersonalWorkspace = useWorkspacesStore(
    (s) => s.updatePersonalWorkspace,
  );
  const updateWorkspace = useWorkspacesStore((s) => s.updateWorkspace);

  const routine = useRoutinesStore((s) =>
    s.getRoutine(personalWorkspace.routineId),
  );

  const handleAssignRoutine = () => {
    const onSelectRoutine = (routine: Routine) => {
      updatePersonalWorkspace({ ...personalWorkspace, routineId: routine.id });
    };

    showModal({
      snapPoints: ["60%", "90%"],
      content: (
        <SelectRoutineModal onSelectRoutine={onSelectRoutine} hideTemplate />
      ),
    });
  };

  const handleRemoveRoutine = () => {
    const onConfirm = () => {
      updatePersonalWorkspace({ ...personalWorkspace, routineId: null });
    };

    showModal({
      snapPoints: ["45%"],
      content: (
        <ConfirmationModal
          title="Quitar rutina activa?"
          description={
            "Seguro que queres quitar esta rutina? Te quedaras sin rutina activa"
          }
          onConfirm={onConfirm}
          confirmText="Eliminar"
          type="danger"
        />
      ),
    });
  };

  const handleChangeRoutine = () => {
    const onSelectRoutine = (routine: Routine) => {
      isPersonalWorkspace
        ? updatePersonalWorkspace({
            ...personalWorkspace,
            routineId: routine.id,
          })
        : updateWorkspace(workspace.id, "routineId", routine.id);
    };

    showModal({
      snapPoints: ["60%", "90%"],
      content: (
        <SelectRoutineModal onSelectRoutine={onSelectRoutine} hideTemplate />
      ),
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-950"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="grow gap-3 p-3"
    >
      {!routine ? (
        <View>
          <Text className="text-white mb-3">
            No tienes ninguna rutina asignada
          </Text>
          <TouchableOpacity
            onPress={handleAssignRoutine}
            className="border rounded-xl p-3 border-neutral-600"
          >
            <Text className="text-white">Asignar rutina</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className=" gap-3">
          <RoutineOverview routine={routine} />

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={handleChangeRoutine}
              className="border rounded-xl p-3 flex-row gap-1 items-center justify-center border-neutral-600 flex-1"
            >
              <Ionicons name="repeat-outline" size={16} color={colors.white} />
              <Text className="text-white">Cambiar rutina</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemoveRoutine}
              className="border rounded-xl p-3 flex-row gap-1 items-center justify-center border-red-900"
            >
              <Ionicons
                name="close-outline"
                size={16}
                color={colors.red[600]}
              />
              <Text className="text-red-600">Quitar rutina</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isPersonalWorkspace && (
        <TouchableOpacity
          onPress={handleDeleteWorkspace}
          className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl p-4 flex-row items-center gap-3"
        >
          <Text className="text-red-600 dark:text-red-500 font-bold text-base">
            Eliminar alumno
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
