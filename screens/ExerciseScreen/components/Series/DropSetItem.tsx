import { Text, TouchableOpacity, View } from "react-native";
import MetricInput from "./MetricInput";
import { useGlobalRoutinesSettings } from "@/stores/GlobalRoutinesSettings";
import { Ionicons } from "@expo/vector-icons";
import PartialReps from "./PartialReps";

export default function DropSetItem({
  index,
  dropSet,
  set,
  updateDropSetField,
  deleteDropSet,
  openDropSetPartialRepsModal,
  deletePartialReps,
}: any) {
  const weightUnit = useGlobalRoutinesSettings((state) => state.weightUnit);

  return (
    <View key={index} className="gap-1 pr-1">
      <View className="flex-row">
        <View className="">
          <Ionicons
            name="return-down-forward-outline"
            size={14}
            className="p-2"
          />
        </View>

        <View className="flex-1 gap-1 flex-row">
          {/* Weight */}
          <MetricInput
            label={<Text>PESO ({weightUnit})</Text>}
            value={dropSet.weight}
            minValue={dropSet.minWeight}
            maxValue={dropSet.maxWeight}
            rangeEnabled={dropSet.weightIsRange}
            onUpdateValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "weight", text)
            }
            onUpdateMinValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "minWeight", text)
            }
            onUpdateMaxValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "maxWeight", text)
            }
            onToggleMinMax={() =>
              updateDropSetField(
                set.id,
                dropSet.id,
                "weightIsRange",
                !dropSet.weightIsRange,
              )
            }
          />

          {/* Reps */}
          <MetricInput
            label={<Text>REPES</Text>}
            value={dropSet.reps}
            minValue={dropSet.minReps}
            maxValue={dropSet.maxReps}
            rangeEnabled={dropSet.repsIsRange}
            onUpdateValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "reps", text)
            }
            onUpdateMinValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "minReps", text)
            }
            onUpdateMaxValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "maxReps", text)
            }
            onToggleMinMax={() =>
              updateDropSetField(
                set.id,
                dropSet.id,
                "repsIsRange",
                !dropSet.repsIsRange,
              )
            }
          />

          {/* Rir */}
          <MetricInput
            label={<Text>RIR</Text>}
            value={dropSet.rir}
            minValue={dropSet.minRir}
            maxValue={dropSet.maxRir}
            rangeEnabled={dropSet.rirIsRange}
            onUpdateValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "rir", text)
            }
            onUpdateMinValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "minRir", text)
            }
            onUpdateMaxValue={(text: string) =>
              updateDropSetField(set.id, dropSet.id, "maxRir", text)
            }
            onToggleMinMax={() =>
              updateDropSetField(
                set.id,
                dropSet.id,
                "rirIsRange",
                !dropSet.rirIsRange,
              )
            }
          />
        </View>
      </View>

      {/* Partials Toggle */}
      <TouchableOpacity
        onPress={() => openDropSetPartialRepsModal(dropSet)}
        className={`justify-center flex-row self-start items-center px-1.5 rounded-full border ${dropSet.partialReps?.count != 0 ? "bg-red-400 border-red-400" : "border-neutral-200"}`}
      >
        {dropSet.partialReps?.count != 0 && (
          <TouchableOpacity onPress={() => deletePartialReps(dropSet.id)}>
            <Ionicons name="close" size={12} className="mr-2" />
          </TouchableOpacity>
        )}

        {dropSet.partialReps?.count != 0 ? (
          <PartialReps set={dropSet} />
        ) : (
          <Text
            className={`text-[10px] font-bold ${dropSet.partialReps?.count != 0 ? "text-white" : "text-neutral-400"}`}
          >
            Parciales
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteDropSet(dropSet.id)}>
        <Text>Eliminar Dropset</Text>
      </TouchableOpacity>
    </View>
  );
}
