import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

import { Workspace } from "@/types/Workspace";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useModalStore } from "@/stores/useModalStore";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

import { Ionicons } from "@expo/vector-icons";

export default function WorkspacesScreen({ navigation }: any) {
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const deleteAllWorkspaces = useWorkspacesStore((s) => s.deleteAllWorkspaces);
  const showModal = useModalStore((s) => s.showModal);

  console.log("Workspaces", workspaces);

  const handleCreateWorkspace = () => {
    navigation.navigate("createWorkspace");
  };

  const handleDeleteAll = () => {
    showModal({
      snapPoints: ["40%"],
      content: (
        <ConfirmationModal
          title="¿Eliminar todos los workspaces?"
          description="Esta acción no se puede deshacer. Se eliminarán todos los workspaces excepto el personal."
          onConfirm={deleteAllWorkspaces}
          confirmText="Eliminar todos"
          type="danger"
        />
      ),
    });
  };

  return (
    <ScrollView contentContainerClassName="p-3 gap-3 flex-1 bg-white">
      <TouchableOpacity onPress={handleCreateWorkspace} className="p-6 border rounded-md">
        <Text>Crear workspace</Text>
      </TouchableOpacity>

      {workspaces.length > 1 ? (
        <TouchableOpacity onPress={handleDeleteAll} className="border p-3 rounded-lg">
          <Text className="text-center">Eliminar todos los workspaces</Text>
        </TouchableOpacity>
      ) : (
        <Text>No hay workspaces</Text>
      )}

      {workspaces.map((workspace, index) => (
        <WorkspaceItem key={workspace.id} index={index} workspace={workspace} />
      ))}
    </ScrollView>
  );
}

const WorkspaceItem = ({ workspace, index }: { workspace: Workspace; index: number }) => {
  const navigation = useNavigation();

  const deleteWorkspace = useWorkspacesStore((state) => state.deleteWorkspace);
  const showModal = useModalStore((s) => s.showModal);

  const handleNavigate = () => {
    navigation.navigate("workspace", { workspaceId: workspace.id });
  };

  const handleDelete = () => {
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
    <View className="flex-row items-center gap-2">
      <TouchableOpacity onPress={handleNavigate} className="p-3 border rounded-md flex-1">
        <Text className="font-bold">{workspace.name || `Workspace ${index + 1}`}</Text>
        {/* <Text className="text-neutral-500"></Text> */}
      </TouchableOpacity>

      {workspace.id !== "default" && (
        <TouchableOpacity onPress={handleDelete} className="p-3 border border-red-200 rounded-md">
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      )}
    </View>
  );
};
