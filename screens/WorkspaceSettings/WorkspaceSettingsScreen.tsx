import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useModalStore } from "@/stores/ModalStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function WorkspaceSettingsScreen({ navigation, route }: any) {
  const { workspaceId } = route.params;

  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const deleteWorkspace = useWorkspacesStore((state) => state.deleteWorkspace);

  if (!workspace) return <Text>Hubo un error inesperado, no se encontro el workspace</Text>;

  const showModal = useModalStore((s) => s.showModal);

  useEffect(() => {
    navigation.setOptions({ title: `${workspace.name} / Settings` });
  }, []);

  const handleDeleteWorkspace = () => {
    const isShared = workspace.isShared || workspace.athleteId;

    if (isShared) {
      showModal({
        snapPoints: ["40%"],
        content: (
          <ConfirmationModal
            title="¿Eliminar workspace compartido?"
            description={`Este workspace está compartido con un alumno. Si lo eliminas, perderá el acceso a sus rutinas.`}
            onConfirm={() => deleteWorkspace(workspace.id)}
            confirmText="Eliminar"
            type="danger"
          />
        ),
      });
    } else {
      deleteWorkspace(workspace.id);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-900"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="grow gap-3 p-3"
    >
      {workspace.id !== "default" ? (
        <TouchableOpacity 
          onPress={handleDeleteWorkspace} 
          className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl p-4 flex-row items-center gap-3"
        >
          <Text className="text-red-600 dark:text-red-500 font-bold text-base">Eliminar workspace</Text>
        </TouchableOpacity>
      ) : (
        <View className="p-4 bg-neutral-50 dark:bg-zinc-900/50 rounded-xl border border-neutral-100 dark:border-zinc-800">
          <Text className="text-neutral-500 dark:text-neutral-400 text-center">Este es tu espacio personal y no puede ser eliminado.</Text>
        </View>
      )}
    </ScrollView>
  );
}
