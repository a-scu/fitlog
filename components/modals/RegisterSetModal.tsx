import { isSameDay } from "date-fns";
import { Text, View } from "react-native";
import { BottomSheetScrollView, BottomSheetTextInput, TouchableOpacity } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

import SetTypes from "@/screens/EditWorkout/components/SetTypes";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useTheme } from "@/stores/ThemeStore";
import { WorkoutSession } from "@/types/History";
import { Set as PlannedSet } from "@/types/Workout";
import EXERCISES from "@/assets/data/exercises.json";
import { capitalize } from "@/utils/text";

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
  const { isDark } = useTheme();

  const advancedMode = useGlobalSettingsStore((s) => s.advancedMode);
  const toggleAdvancedMode = useGlobalSettingsStore((s) => s.toggleAdvancedMode);
  const addDropSet = useWorkoutsHistoryStore((s) => s.addDropSet);
  const updateDropSetField = useWorkoutsHistoryStore((s) => s.updateDropSetField);
  const removeDropSet = useWorkoutsHistoryStore((s) => s.removeDropSet);

  const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);

  return (
    <BottomSheetScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
      {/* Header */}
      <View className="mb-2">
        <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
          Registrar Serie
        </Text>
        <Text className="text-neutral-900 dark:text-white text-xl font-bold mt-0.5">
          {exercise ? capitalize(exercise.name) : "Serie"}
        </Text>
      </View>

      {/* Advanced Mode Toggle */}
      <TouchableOpacity
        onPress={toggleAdvancedMode}
        activeOpacity={0.8}
        className="flex-row items-center gap-2 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl p-3.5 justify-center border border-neutral-200/50 dark:border-neutral-700/30"
      >
        <Ionicons
          name="options-outline"
          size={16}
          color={isDark ? "#a3a3a3" : "#525252"}
        />
        <Text className="text-neutral-700 dark:text-neutral-300 font-medium text-sm">
          Modo avanzado: {advancedMode ? "Sí" : "No"}
        </Text>
      </TouchableOpacity>

      {advancedMode && set && <SetTypes set={set as any} hideCustom />}

      {/* Main Inputs: Weight & Reps */}
      <View className="gap-3 flex-row">
        <View className="flex-1">
          <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
            Peso <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedSet?.weight?.value || "-"} kg)</Text>
          </Text>
          <BottomSheetTextInput
            selectTextOnFocus
            keyboardType="numeric"
            defaultValue={set?.weight?.toString() || plannedSet?.weight?.value || ""}
            onChangeText={(value) => updateSetField(date, setId, exerciseId, "weight", value)}
            placeholder="0"
            placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
            className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
          />
        </View>

        <View className="flex-1">
          <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
            Reps <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedSet?.reps?.value || "-"})</Text>
          </Text>
          <BottomSheetTextInput
            selectTextOnFocus
            keyboardType="numeric"
            defaultValue={set?.reps?.toString() || plannedSet?.reps?.value || ""}
            onChangeText={(value) => updateSetField(date, setId, exerciseId, "reps", value)}
            placeholder="0"
            placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
            className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
          />
        </View>
      </View>

      {/* Advanced Inputs: RIR & Partials */}
      {advancedMode && (
        <View className="gap-3 flex-row">
          <View className="flex-1">
            <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
              RIR <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedSet?.rir?.value || "-"})</Text>
            </Text>
            <BottomSheetTextInput
              selectTextOnFocus
              keyboardType="numeric"
              defaultValue={set?.rir?.toString() || plannedSet?.rir?.value || ""}
              onChangeText={(value) => updateSetField(date, setId, exerciseId, "rir", value)}
              placeholder="0"
              placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
              className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
            />
          </View>

          <View className="flex-1">
            <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
              Reps Parciales
            </Text>
            <BottomSheetTextInput
              selectTextOnFocus
              keyboardType="numeric"
              defaultValue={set?.partialReps?.toString() || ""}
              onChangeText={(value) => updateSetField(date, setId, exerciseId, "partialReps", value)}
              placeholder="0"
              placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
              className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
            />
          </View>
        </View>
      )}

      {/* Dropsets */}
      {advancedMode && (
        <View className="gap-3 mt-2">
          <TouchableOpacity
            onPress={() => addDropSet(date, setId)}
            activeOpacity={0.8}
            className="border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30 p-3.5 rounded-xl items-center flex-row justify-center gap-1.5"
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={isDark ? "#a3a3a3" : "#525252"}
            />
            <Text className="text-neutral-700 dark:text-neutral-300 font-semibold text-sm">
              Agregar drop set
            </Text>
          </TouchableOpacity>

          {(set?.dropSets?.length || 0) === 0 && (plannedSet?.dropSets?.length || 0) > 0 ? (
            <View className="mt-2">
              <Text className="font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                Dropsets Planeados
              </Text>
              {plannedSet?.dropSets?.map((dropSet, index) => (
                <View
                  key={dropSet.id}
                  className="border border-dashed border-neutral-300 dark:border-neutral-700 p-4 rounded-xl mt-2 bg-neutral-50/50 dark:bg-neutral-800/30"
                >
                  <Text className="text-neutral-400 dark:text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                    Dropset {index + 1} (No registrado)
                  </Text>
                  <View className="gap-3 flex-row mt-2">
                    <View className="flex-1">
                      <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">
                        Peso <Text className="text-neutral-400 dark:text-neutral-500">({dropSet.weight?.value || "-"})</Text>
                      </Text>
                      <BottomSheetTextInput
                        selectTextOnFocus
                        keyboardType="numeric"
                        defaultValue={dropSet.weight?.value || ""}
                        onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "weight", value)}
                        placeholder="0"
                        placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm p-2.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">
                        Reps <Text className="text-neutral-400 dark:text-neutral-500">({dropSet.reps?.value || "-"})</Text>
                      </Text>
                      <BottomSheetTextInput
                        selectTextOnFocus
                        keyboardType="numeric"
                        defaultValue={dropSet.reps?.value || ""}
                        onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "reps", value)}
                        placeholder="0"
                        placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm p-2.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            set?.dropSets &&
            set.dropSets?.length > 0 && (
              <View className="mt-2">
                <Text className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Dropsets
                </Text>
                {set.dropSets?.map((dropSet, index) => {
                  const plannedDS = plannedSet?.dropSets?.[index];
                  return (
                    <View
                      key={dropSet.id}
                      className="border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl mt-2 bg-neutral-50/30 dark:bg-neutral-800/20"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-neutral-500 dark:text-neutral-400 font-bold text-sm">
                          Dropset {index + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeDropSet(date, setId, dropSet.id)}
                          className="p-1"
                        >
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      <View className="gap-3 flex-row">
                        <View className="flex-1">
                          <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">
                            Peso <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedDS?.weight?.value || "-"})</Text>
                          </Text>
                          <BottomSheetTextInput
                            selectTextOnFocus
                            keyboardType="numeric"
                            defaultValue={dropSet.weight?.toString() || plannedDS?.weight?.value || ""}
                            onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "weight", value)}
                            placeholder="0"
                            placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                            className="border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm p-2.5 text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 font-semibold"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">
                            Reps <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedDS?.reps?.value || "-"})</Text>
                          </Text>
                          <BottomSheetTextInput
                            selectTextOnFocus
                            keyboardType="numeric"
                            defaultValue={dropSet.reps?.toString() || plannedDS?.reps?.value || ""}
                            onChangeText={(value) => updateDropSetField(date, setId, dropSet.id, "reps", value)}
                            placeholder="0"
                            placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                            className="border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm p-2.5 text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 font-semibold"
                          />
                        </View>
                      </View>
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
