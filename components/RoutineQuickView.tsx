import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { Routine } from "@/types/Routine";

import { getLocalizedDayShort } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useModalStore } from "@/stores/ModalStore";
import { SelectRoutineModal } from "./modals/SelectRoutineModal";

export default function RoutineQuickView({
  routine,
}: {
  routine: Routine;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // No hay rutina
  if (!routine) {
    const showModal = useModalStore((s) => s.showModal);

    const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);
    const updatePersonalWorkspace = useWorkspacesStore(
      (s) => s.updatePersonalWorkspace,
    );

    const handleAssignRoutine = () => {
      const onSelectRoutine = (routine: Routine) => {
        updatePersonalWorkspace({
          ...personalWorkspace,
          routineId: routine.id,
        });
      };

      showModal({
        snapPoints: ["60%", "90%"],
        content: (
          <SelectRoutineModal onSelectRoutine={onSelectRoutine} hideTemplate />
        ),
      });
    };

    return (
      <TouchableOpacity
        onPress={handleAssignRoutine}
        className="rounded-2xl border border-neutral-200 gap-1 dark:border-amber-900 bg-amber-950/25 items-center justify-center p-4"
      >
        <View className="justify-end flex-row gap-1 absolute top-4 right-4">
          <Text className="text-amber-700 text-end text-xs">
            Asignar rutina
          </Text>
          <Ionicons
            name="enter-outline"
            className="!text-xs !leading-none"
            color={colors.amber[700]}
          />
        </View>

        <View className="items-center">
          <Ionicons
            name="warning-outline"
            size={16}
            color={colors.amber[600]}
          />
          <Text className="text-amber-600 font-medium text-sm">
            No tienes rutina activa
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("routine", { routineId: routine.id })}
      className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5"
    >
      <View className="flex-row items-start justify-between flex-1">
        <Text className="text-neutral-500 text-sm">Rutina</Text>

        <View className="justify-end flex-row gap-1 flex-1">
          <Text className="text-neutral-400 text-end text-sm">Ver rutina</Text>
          <Ionicons
            name="enter-outline"
            className="!text-sm !leading-none"
            color={colors.neutral[400]}
          />
        </View>
      </View>

      <Text className="font-bold text-xl mb-0.5 text-neutral-900 dark:text-white">
        {routine.name || "Rutina sin nombre"}
      </Text>

      <View className="flex-row gap-3">
        {routine.days.map((day) => (
          <Text
            key={day.dayIndex}
            className={`${day.isRestDay ? "text-neutral-400" : "text-green-500"}`}
          >
            {getLocalizedDayShort(day.dayIndex, t)}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}
