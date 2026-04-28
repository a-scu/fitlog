import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useModalStore } from "@/stores/useModalStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { Routine } from "@/types/Routine";
import colors from "tailwindcss/colors";

export function SelectRoutineModal({
  onSelectRoutine,
  excludeId,
  templateOnly,
  hideTemplate,
}: {
  onSelectRoutine: (routine: Routine, asTemplate: boolean) => void;
  excludeId?: string;
  templateOnly?: boolean;
  hideTemplate?: boolean;
}) {
  const routines = useRoutinesStore((s) => s.routines);
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const hideModal = useModalStore((s) => s.hideModal);

  const filteredRoutines = routines.filter((r) => r.id !== excludeId);

  return (
    <View className="flex-1 bg-white rounded-t-3xl p-5 gap-4">
      <Text className="text-xl font-bold">Seleccionar Rutina</Text>

      {filteredRoutines.length === 0 ? (
        <Text className="text-neutral-500">No hay otras rutinas creadas o disponibles para elegir.</Text>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-3">
          {filteredRoutines.map((routine) => (
            <View key={routine.id} className="border border-neutral-200 rounded-xl p-3 flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="font-bold text-lg">{routine.name || "Rutina sin nombre"}</Text>
                <Text className="text-neutral-500 text-xs">{routine.days.length} días</Text>
                <Text className="text-neutral-400 text-[10px]" numberOfLines={1}>
                  {workspaces.filter((w) => w.routineId === routine.id).length > 0
                    ? `Uso: ${workspaces
                        .filter((w) => w.routineId === routine.id)
                        .map((w) => w.name || "Sin nombre")
                        .join(", ")}`
                    : "Sin uso"}
                </Text>
              </View>

              {!templateOnly && (
                <TouchableOpacity
                  onPress={() => {
                    onSelectRoutine(routine, false);
                    hideModal();
                  }}
                  className="bg-neutral-100 px-3 py-2 rounded-lg"
                >
                  <Text className="font-medium text-neutral-800">Usar</Text>
                </TouchableOpacity>
              )}

              {!hideTemplate && (
                <TouchableOpacity
                  onPress={() => {
                    onSelectRoutine(routine, true);
                    hideModal();
                  }}
                  className="bg-neutral-800 px-3 py-2 rounded-lg flex-row items-center gap-1"
                >
                  <Ionicons name="copy-outline" size={16} color="white" />
                  <Text className="font-medium text-white">Plantilla</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
