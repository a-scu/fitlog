import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useModalStore } from "@/stores/useModalStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import MetricInput from "./MetricInput";
import PartialReps from "./PartialReps";
import PartialRepsModal from "../modals/PartialRepsModal";

import { Set as SetType, DropSet as DropSetType } from "@/types/Workout";
import colors from "tailwindcss/colors";

export default function DropSet({ set, dropSet, index }: { set: SetType; dropSet: DropSetType; index: number }) {
  const updateDropSetMetricField = useWorkoutsStore((s) => s.updateDropSetMetricField);
  const deleteDropSet = useWorkoutsStore((s) => s.deleteDropSet);
  const deletePartialReps = useWorkoutsStore((s) => s.deletePartialReps);
  const updateDropSetPartialRepsField = useWorkoutsStore((s) => s.updateDropSetPartialRepsField);
  const showModal = useModalStore((s) => s.showModal);

  const openDropSetPartialRepsModal = () => {
    showModal({
      content: (
        <PartialRepsModal
          set={dropSet}
          updatePartialRepsField={(id: string, field: string, value: any) =>
            updateDropSetPartialRepsField(set.id, id, field, value)
          }
        />
      ),
    });
  };

  const weightUnit = useGlobalSettingsStore((state) => state.weightUnit);

  const hasPartialReps = dropSet.partialReps.isRange
    ? dropSet.partialReps.min && dropSet.partialReps.max
    : dropSet.partialReps.value;

  return (
    <View key={index} className="gap-1.5 pr-1">
      <View className="flex-row items-center">
        <View className="items-center justify-center p-2">
          <Text className="leading-none text-sm">{index + 1}</Text>
          <Ionicons name="return-down-forward-outline" className="text-base leading-none" />
        </View>

        <View className="flex-1 gap-1.5 flex-row">
          {/* Weight */}
          <MetricInput
            label={`PESO (${weightUnit})`}
            metric={dropSet.weight}
            onUpdateValue={(text) => updateDropSetMetricField(set.id, dropSet.id, "weight", "value", text)}
            onUpdateMin={(text) => updateDropSetMetricField(set.id, dropSet.id, "weight", "min", text)}
            onUpdateMax={(text) => updateDropSetMetricField(set.id, dropSet.id, "weight", "max", text)}
            onToggleRange={() =>
              updateDropSetMetricField(set.id, dropSet.id, "weight", "isRange", !dropSet.weight.isRange)
            }
          />

          {/* Reps */}
          <MetricInput
            label="REPES"
            metric={dropSet.reps}
            onUpdateValue={(text) => updateDropSetMetricField(set.id, dropSet.id, "reps", "value", text)}
            onUpdateMin={(text) => updateDropSetMetricField(set.id, dropSet.id, "reps", "min", text)}
            onUpdateMax={(text) => updateDropSetMetricField(set.id, dropSet.id, "reps", "max", text)}
            onToggleRange={() => updateDropSetMetricField(set.id, dropSet.id, "reps", "isRange", !dropSet.reps.isRange)}
          />

          {/* RIR */}
          <MetricInput
            label="RIR"
            metric={dropSet.rir}
            onUpdateValue={(text) => updateDropSetMetricField(set.id, dropSet.id, "rir", "value", text)}
            onUpdateMin={(text) => updateDropSetMetricField(set.id, dropSet.id, "rir", "min", text)}
            onUpdateMax={(text) => updateDropSetMetricField(set.id, dropSet.id, "rir", "max", text)}
            onToggleRange={() => updateDropSetMetricField(set.id, dropSet.id, "rir", "isRange", !dropSet.rir.isRange)}
          />
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        {/* Partials Toggle */}
        {hasPartialReps ? (
          <TouchableOpacity
            onPress={openDropSetPartialRepsModal}
            className={`justify-center flex-row self-start items-center px-1.5 rounded-full border ${
              hasPartialReps ? "bg-red-400 border-red-400" : "border-neutral-200"
            }`}
          >
            {hasPartialReps && (
              <TouchableOpacity onPress={() => deletePartialReps(set.id, dropSet.id)}>
                <Ionicons name="close" size={12} className="mr-2" />
              </TouchableOpacity>
            )}
            {hasPartialReps ? (
              <PartialReps set={dropSet} />
            ) : (
              <Text className="text-[10px] font-bold text-neutral-400">Parciales</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={openDropSetPartialRepsModal}
            className="flex-row items-center gap-1 border rounded-md border-neutral-200 py-1 px-2"
          >
            <Text className="text-xs text-neutral-400">Parciales</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => deleteDropSet(set.id, dropSet.id)}
          className="flex-row items-center gap-1 border rounded-md border-neutral-200 py-1 px-2"
        >
          <Ionicons name="trash-bin-outline" className="!text-xs !leading-none" color={colors.neutral[400]} />
          <Text className="text-xs text-neutral-400">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
