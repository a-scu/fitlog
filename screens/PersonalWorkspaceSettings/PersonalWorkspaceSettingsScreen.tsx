import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { SelectRoutineModal } from "@/components/modals/SelectRoutineModal";
import { useModalStore } from "@/stores/ModalStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { Routine } from "@/types/Routine";
import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function PersonalWorkspaceSettingsScreen({ navigation }: any) {
  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);
  const updatePersonalWorkspace = useWorkspacesStore(
    (s) => s.updatePersonalWorkspace,
  );

  const showModal = useModalStore((s) => s.showModal);

  const getRoutine = useRoutinesStore((s) => s.getRoutine);
  const routine = getRoutine(personalWorkspace.routineId);

  useEffect(() => {
    navigation.setOptions({ title: "Settings" });
  }, []);

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

  return (
    <ScrollView contentContainerClassName="grow p-3 bg-white dark:bg-neutral-900 gap-3">
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
        <View>
          <Text className="text-white mb-3">Rutina activa: {routine.name}</Text>
          <TouchableOpacity
            onPress={handleRemoveRoutine}
            className="border rounded-xl p-3 border-neutral-600"
          >
            <Text className="text-white">Quitar rutina</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
