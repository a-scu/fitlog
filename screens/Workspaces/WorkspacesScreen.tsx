import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

import { Workspace } from "@/types/Workspace";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useModalStore } from "@/stores/ModalStore";
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
          title="¿Eliminar todos los alumnos?"
          description="Esta acción no se puede deshacer. Se eliminarán todos los alumnos excepto el espacio personal."
          onConfirm={deleteAllWorkspaces}
          confirmText="Eliminar todos"
          type="danger"
        />
      ),
    });
  };

  return (
    <ScrollView contentContainerClassName="p-4 gap-4 flex-1 bg-neutral-50 dark:bg-neutral-950">
      <TouchableOpacity
        onPress={handleCreateWorkspace}
        className="p-6 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl items-center justify-center flex-row gap-2"
      >
        <Ionicons name="add-circle-outline" size={24} color="#10b981" />
        <Text className="text-neutral-900 dark:text-white font-bold text-lg">
          Crear Alumno
        </Text>
      </TouchableOpacity>

      {workspaces.length > 0 ? (
        <TouchableOpacity
          onPress={handleDeleteAll}
          className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="trash-bin-outline" size={18} color="#ef4444" />
          <Text className="text-red-600 dark:text-red-500 font-medium">
            Eliminar todos los alumnos
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="items-center py-6">
          <Text className="text-neutral-400 dark:text-neutral-500">
            No hay alumnos adicionales
          </Text>
        </View>
      )}

      <View className="gap-3">
        {workspaces.map((workspace, index) => (
          <WorkspaceItem
            key={workspace.id}
            index={index}
            workspace={workspace}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const WorkspaceItem = ({
  workspace,
  index,
}: {
  workspace: Workspace;
  index: number;
}) => {
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
            title="¿Eliminar alumno compartido?"
            description={`Este espacio está compartido con un alumno. Si lo eliminas, perderá el acceso a sus rutinas.`}
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
      <TouchableOpacity
        onPress={handleNavigate}
        className="p-4 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-2xl flex-1 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 items-center justify-center">
            <Ionicons
              name={workspace.id === "default" ? "person" : "people"}
              size={20}
              color="#10b981"
            />
          </View>
          <View>
            <Text className="font-bold text-neutral-900 dark:text-white text-base">
              {workspace.name || `Alumno ${index + 1}`}
            </Text>
            {workspace.id === "default" && (
              <Text className="text-neutral-500 dark:text-neutral-400 text-xs">
                Espacio personal
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {workspace.id !== "default" && (
        <TouchableOpacity
          onPress={handleDelete}
          className="p-4 border border-red-200 dark:border-red-900/30 bg-white dark:bg-neutral-800 rounded-2xl items-center justify-center shadow-sm"
        >
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};
