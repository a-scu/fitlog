import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useModalStore } from "@/stores/useModalStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

import MetricInput from "./MetricInput";
import PartialReps from "./PartialReps";
import PartialRepsModal from "../modals/PartialRepsModal";

import { Set as SetType, DropSet as DropSetType } from "@/types/Routine";

export default function DropSet({ set, dropSet, index }: { set: SetType; dropSet: DropSetType; index: number }) {
  const updateDropSetMetricField = useRoutinesStore((s) => s.updateDropSetMetricField);
  const deleteDropSet = useRoutinesStore((s) => s.deleteDropSet);
  const deletePartialReps = useRoutinesStore((s) => s.deletePartialReps);
  const updateDropSetPartialRepsField = useRoutinesStore((s) => s.updateDropSetPartialRepsField);
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
    <View key={index} className="gap-1 pr-1">
      <View className="flex-row">
        <Ionicons name="return-down-forward-outline" size={14} className="p-2" />

        <View className="flex-1 gap-1 flex-row">
          {/* Weight */}
          <MetricInput
            label={<Text>PESO ({weightUnit})</Text>}
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
            label={<Text>REPES</Text>}
            metric={dropSet.reps}
            onUpdateValue={(text) => updateDropSetMetricField(set.id, dropSet.id, "reps", "value", text)}
            onUpdateMin={(text) => updateDropSetMetricField(set.id, dropSet.id, "reps", "min", text)}
            onUpdateMax={(text) => updateDropSetMetricField(set.id, dropSet.id, "reps", "max", text)}
            onToggleRange={() => updateDropSetMetricField(set.id, dropSet.id, "reps", "isRange", !dropSet.reps.isRange)}
          />

          {/* RIR */}
          <MetricInput
            label={<Text>RIR</Text>}
            metric={dropSet.rir}
            onUpdateValue={(text) => updateDropSetMetricField(set.id, dropSet.id, "rir", "value", text)}
            onUpdateMin={(text) => updateDropSetMetricField(set.id, dropSet.id, "rir", "min", text)}
            onUpdateMax={(text) => updateDropSetMetricField(set.id, dropSet.id, "rir", "max", text)}
            onToggleRange={() => updateDropSetMetricField(set.id, dropSet.id, "rir", "isRange", !dropSet.rir.isRange)}
          />
        </View>
      </View>

      {/* Partials Toggle */}
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

      <TouchableOpacity onPress={() => deleteDropSet(set.id, dropSet.id)}>
        <Text>Eliminar Dropset</Text>
      </TouchableOpacity>
    </View>
  );
}
