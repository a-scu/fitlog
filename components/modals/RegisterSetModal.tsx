import SetTypes from "@/screens/EditWorkout/components/SetTypes";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { WorkoutSession } from "@/types/History";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView, BottomSheetTextInput, TouchableOpacity } from "@gorhom/bottom-sheet";
import { isSameDay } from "date-fns";
import { Text, View } from "react-native";

import { Set as PlannedSet } from "@/types/Workout";

interface RegisterSetModalProps {
  date: WorkoutSession["date"];
  setId: string;
  exerciseId: string;
  plannedSet?: PlannedSet;
}

export default function RegisterSetModal({ date, setId, exerciseId, plannedSet }: RegisterSetModalProps) {
  const set = useWorkoutsHistoryStore((s) =>
    s.workoutSessions.find((session) => isSameDay(session.date, date))?.sets.find((set) => set.id === setId),
  );
  const updateSetField = useWorkoutsHistoryStore((s) => s.updateSetField);
  const toggleSetCompleted = useWorkoutsHistoryStore((s) => s.toggleSetCompleted);

  const advancedMode = useGlobalSettingsStore((s) => s.advancedMode);
  const toggleAdvancedMode = useGlobalSettingsStore((s) => s.toggleAdvancedMode);
  const addDropSet = useWorkoutsHistoryStore((s) => s.addDropSet);
  const updateDropSetField = useWorkoutsHistoryStore((s) => s.updateDropSetField);
  const removeDropSet = useWorkoutsHistoryStore((s) => s.removeDropSet);

  return (
    <BottomSheetScrollView contentContainerStyle={{ gap: 16, padding: 12 }}>
      <Text className="">Register set data modal</Text>

      <TouchableOpacity
        onPress={toggleAdvancedMode}
        className="flex-row items-center gap-1 border rounded-xl p-3 justify-center"
      >
        <Text>Modo avanzado: {advancedMode ? "si" : "no"}</Text>
      </TouchableOpacity>

      {advancedMode && set && <SetTypes set={set as any} hideCustom />}

      <View className="gap-3 flex-row">
        <View className="flex-1">
          <Text>
            weight <Text className="text-neutral-400">({plannedSet?.weight?.value || "-"})</Text>
          </Text>
          <BottomSheetTextInput
            selectTextOnFocus
            defaultValue={set?.weight?.toString() || plannedSet?.weight?.value || ""}
            onChangeText={(value) => updateSetField(date, setId, exerciseId, "weight", value)}
            className="border rounded-xl p-3"
          />
        </View>

        <View className="flex-1">
          <Text>
            reps <Text className="text-neutral-400">({plannedSet?.reps?.value || "-"})</Text>
          </Text>
          <BottomSheetTextInput
            selectTextOnFocus
            defaultValue={set?.reps?.toString() || plannedSet?.reps?.value || ""}
            onChangeText={(value) => updateSetField(date, setId, exerciseId, "reps", value)}
            className="border rounded-xl p-3"
          />
        </View>
      </View>

      <View className="gap-3 flex-row">
        {advancedMode && (
          <View className="flex-1">
            <Text>
              rir <Text className="text-neutral-400">({plannedSet?.rir?.value || "-"})</Text>
            </Text>
            <BottomSheetTextInput
              selectTextOnFocus
              defaultValue={set?.rir?.toString() || plannedSet?.rir?.value || ""}
              onChangeText={(value) => updateSetField(date, setId, exerciseId, "rir", value)}
              className="border rounded-xl p-3"
            />
          </View>
        )}

        {advancedMode && (
          <View className="flex-1">
            <Text>partialReps</Text>
            <BottomSheetTextInput
              selectTextOnFocus
              defaultValue={set?.partialReps?.toString() || ""}
              onChangeText={(value) => updateSetField(date, setId, exerciseId, "partialReps", value)}
              className="border rounded-xl p-3"
            />
          </View>
        )}
      </View>

      {advancedMode && (
        <View className="gap-3">
          <TouchableOpacity onPress={() => addDropSet(date, setId)} className="border p-3 rounded-xl">
            <Text>Agregar drop set</Text>
          </TouchableOpacity>

          {(set?.dropSets?.length || 0) === 0 && (plannedSet?.dropSets?.length || 0) > 0 ? (
            <View>
              <Text className="font-bold text-neutral-500">Dropsets Planeados</Text>
              {plannedSet?.dropSets?.map((dropSet, index) => (
                <View
                  key={dropSet.id}
                  className="border border-dashed border-neutral-300 p-3 rounded-xl mt-2 bg-neutral-50"
                >
                  <Text className="text-neutral-400 text-xs">Dropset {index + 1} (No registrado)</Text>
                  <View className="gap-3 flex-row mt-1">
                    <View className="flex-1">
                      <Text>
                        weight <Text className="text-neutral-400">({dropSet.weight?.value || "-"})</Text>
                      </Text>
                      <BottomSheetTextInput
                        selectTextOnFocus
                        defaultValue={dropSet.weight?.value || ""}
                        onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "weight", value)}
                        className="border border-neutral-200 rounded-xl text-xs p-2 bg-white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text>
                        reps <Text className="text-neutral-400">({dropSet.reps?.value || "-"})</Text>
                      </Text>
                      <BottomSheetTextInput
                        selectTextOnFocus
                        defaultValue={dropSet.reps?.value || ""}
                        onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "reps", value)}
                        className="border border-neutral-200 rounded-xl text-xs p-2 bg-white"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            set?.dropSets &&
            set.dropSets?.length > 0 && (
              <View>
                <Text className="font-bold">Dropsets</Text>
                {set.dropSets?.map((dropSet, index) => {
                  const plannedDS = plannedSet?.dropSets?.[index];
                  return (
                    <View key={dropSet.id} className="border p-3 rounded-xl mt-2">
                      <Text>{index + 1}</Text>
                      <View className="gap-3 flex-row">
                        <View className="flex-1">
                          <Text>
                            weight <Text className="text-neutral-400">({plannedDS?.weight?.value || "-"})</Text>
                          </Text>
                          <BottomSheetTextInput
                            selectTextOnFocus
                            defaultValue={dropSet.weight?.toString() || plannedDS?.weight?.value || ""}
                            onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "weight", value)}
                            className="border rounded-xl text-xs p-2"
                          />
                        </View>
                        <View className="flex-1">
                          <Text>
                            reps <Text className="text-neutral-400">({plannedDS?.reps?.value || "-"})</Text>
                          </Text>
                          <BottomSheetTextInput
                            selectTextOnFocus
                            defaultValue={dropSet.reps?.toString() || plannedDS?.reps?.value || ""}
                            onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "reps", value)}
                            className="border rounded-xl text-xs p-2"
                          />
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeDropSet(date, setId, dropSet.id)} className="mt-2">
                        <Ionicons name="close" className="!text-xl text-red-500" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )
          )}
        </View>
      )}
    </BottomSheetScrollView>
  );
}
