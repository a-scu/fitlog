import { isSameDay } from "date-fns";
import { Text, View, TouchableOpacity } from "react-native";
import { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

import SetTypes from "@/screens/EditWorkout/components/SetTypes";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useTheme } from "@/stores/ThemeStore";
import { WorkoutSession } from "@/types/History";
import { Set as PlannedSet } from "@/types/Workout";
import EXERCISES from "@/assets/data/exercises.json";
import { capitalize } from "@/utils/text";
import colors from "tailwindcss/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RegisterSetModalProps {
  date: WorkoutSession["date"];
  setId: string;
  exerciseId: string;
  plannedSet?: PlannedSet;
}

export default function RegisterSetModal({ date, setId, exerciseId, plannedSet }: RegisterSetModalProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const advancedMode = useGlobalSettingsStore((s) => s.advancedMode);
  const toggleAdvancedMode = useGlobalSettingsStore((s) => s.toggleAdvancedMode);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date));
  const updateSetField = useWorkoutsHistoryStore((s) => s.updateSetField);
  const updateDropSetField = useWorkoutsHistoryStore((s) => s.updateDropSetField);
  const removeDropSet = useWorkoutsHistoryStore((s) => s.removeDropSet);
  const addDropSet = useWorkoutsHistoryStore((s) => s.addDropSet);

  const set = workoutSession.sets.find((set) => set.id === setId);

  const exercise = EXERCISES.find((e) => e.exerciseId === exerciseId);

  const mergedDropSets = (() => {
    const list: {
      id: string;
      type: "matched" | "planned" | "extra";
      label: string;
      plannedWeight?: string;
      plannedReps?: string;
      loggedWeight?: number;
      loggedReps?: number;
      plannedDropSetId?: string;
      loggedDropSetId?: string;
    }[] = [];

    const plannedDS = plannedSet?.dropSets || [];
    const loggedDS = set?.dropSets || [];

    const matchedLoggedIds = new Set<string>();

    // 1. Process planned dropsets
    plannedDS.forEach((pd, index) => {
      const matchingLogged = loggedDS.find(ld => ld.plannedDropSetId === pd.id);

      if (matchingLogged) {
        matchedLoggedIds.add(matchingLogged.id);
        list.push({
          id: matchingLogged.id,
          type: "matched",
          label: `Dropset ${index + 1}`,
          plannedWeight: pd.weight?.value,
          plannedReps: pd.reps?.value,
          loggedWeight: matchingLogged.weight,
          loggedReps: matchingLogged.reps,
          plannedDropSetId: pd.id,
          loggedDropSetId: matchingLogged.id,
        });
      } else {
        list.push({
          id: pd.id,
          type: "planned",
          label: `Dropset ${index + 1}`,
          plannedWeight: pd.weight?.value,
          plannedReps: pd.reps?.value,
          plannedDropSetId: pd.id,
        });
      }
    });

    // 2. Process extra logged dropsets
    let extraCount = 0;
    loggedDS.forEach((ld) => {
      if (!matchedLoggedIds.has(ld.id)) {
        extraCount++;
        list.push({
          id: ld.id,
          type: "extra",
          label: `Dropset ${plannedDS.length + extraCount}`,
          loggedWeight: ld.weight,
          loggedReps: ld.reps,
          loggedDropSetId: ld.id,
        });
      }
    });

    return list;
  })();

  return (
    <BottomSheetScrollView contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 16 + insets.bottom }}>
      {/* Header */}
      <View className="mb-2">
        <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">Registrar Serie</Text>
        <Text className="text-neutral-900 dark:text-white text-xl font-bold mt-0.5">{exercise ? capitalize(exercise.name) : "Serie"}</Text>
      </View>

      {/* Advanced Mode Toggle */}
      <TouchableOpacity
        onPress={toggleAdvancedMode}
        activeOpacity={0.8}
        className="flex-row items-center gap-2 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl p-3.5 justify-center border border-neutral-200/50 dark:border-neutral-700/30"
      >
        <Ionicons name="options-outline" size={16} color={isDark ? "#a3a3a3" : "#525252"} />
        <Text className="text-neutral-700 dark:text-neutral-300 font-medium text-sm">Modo avanzado: {advancedMode ? "Sí" : "No"}</Text>
      </TouchableOpacity>

      {advancedMode && set && <SetTypes set={set as any} hideCustom />}

      {/* Main Inputs: Weight & Reps */}
      <View className="gap-3 flex-row">
        <View className="flex-1">
          <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
            Peso {plannedSet?.weight?.value ? (
              <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedSet.weight.value} kg)</Text>
            ) : null}
          </Text>
          <BottomSheetTextInput
            selectTextOnFocus
            keyboardType="numeric"
            defaultValue={set?.weight?.toString() || plannedSet?.weight?.value || ""}
            onChangeText={(value) => updateSetField(date, setId, exerciseId, "weight", value)}
            placeholder="0"
            placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
            className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
          />
        </View>

        <View className="flex-1">
          <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
            Reps {plannedSet?.reps?.value ? (
              <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedSet.reps.value})</Text>
            ) : null}
          </Text>
          <BottomSheetTextInput
            selectTextOnFocus
            keyboardType="numeric"
            defaultValue={set?.reps?.toString() || plannedSet?.reps?.value || ""}
            onChangeText={(value) => updateSetField(date, setId, exerciseId, "reps", value)}
            placeholder="0"
            placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
            className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
          />
        </View>
      </View>

      {/* Advanced Inputs: RIR & Partials */}
      {advancedMode && (
        <View className="gap-3 flex-row">
          <View className="flex-1">
            <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">
              RIR {plannedSet?.rir?.value ? (
                <Text className="text-neutral-400 dark:text-neutral-500 font-normal">({plannedSet.rir.value})</Text>
              ) : null}
            </Text>
            <BottomSheetTextInput
              selectTextOnFocus
              keyboardType="numeric"
              defaultValue={set?.rir?.toString() || plannedSet?.rir?.value || ""}
              onChangeText={(value) => updateSetField(date, setId, exerciseId, "rir", value)}
              placeholder="0"
              placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
              className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
            />
          </View>

          <View className="flex-1">
            <Text className="text-neutral-600 dark:text-neutral-400 font-medium mb-1.5 text-sm">Reps Parciales</Text>
            <BottomSheetTextInput
              selectTextOnFocus
              keyboardType="numeric"
              defaultValue={set?.partialReps?.toString() || ""}
              onChangeText={(value) => updateSetField(date, setId, exerciseId, "partialReps", value)}
              placeholder="0"
              placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
              className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white rounded-xl p-3.5 text-base font-semibold"
            />
          </View>
        </View>
      )}

      {/* Dropsets */}
      {advancedMode && (
        <View className="gap-3 mt-2">
          <TouchableOpacity
            onPress={() => addDropSet(date, setId, exerciseId)}
            activeOpacity={0.8}
            className="border border-solid w-full border-neutral-300 dark:border-neutral-700 p-3.5 rounded-xl items-center flex-row justify-center gap-1.5"
          >
            <Ionicons name="add-outline" size={14} color={isDark ? colors.neutral[300] : colors.neutral[700]} />
            <Text className="text-neutral-700 dark:text-neutral-300 font-semibold">Agregar drop set</Text>
          </TouchableOpacity>

          {mergedDropSets.length > 0 && (
            <View className="mt-2 gap-2">
              <Text className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">Dropsets</Text>
              {mergedDropSets.map((item) => {
                const isMatched = item.type === "matched";
                const isPlanned = item.type === "planned";
                const isExtra = item.type === "extra";

                let borderStyle = "border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20";
                let badgeColor = "text-neutral-500 dark:text-neutral-400";
                let iconColor = isDark ? "#a3a3a3" : "#525252";
                let iconName = "ellipse-outline";

                if (isMatched) {
                  borderStyle = "border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/5 dark:bg-emerald-950/5";
                  badgeColor = "text-emerald-600 dark:text-emerald-400";
                  iconColor = "#10b981";
                  iconName = "checkmark-circle-outline";
                } else if (isPlanned) {
                  borderStyle = "border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/10 dark:bg-neutral-800/5";
                  badgeColor = "text-neutral-400 dark:text-neutral-500";
                } else if (isExtra) {
                  borderStyle = "border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-50/5 dark:bg-indigo-950/5";
                  badgeColor = "text-indigo-600 dark:text-indigo-400";
                  iconColor = "#6366f1";
                  iconName = "add-circle-outline";
                }

                return (
                  <View
                    key={item.id}
                    className={`border p-4 rounded-xl ${borderStyle}`}
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center gap-1.5">
                        {!isPlanned && <Ionicons name={iconName as any} size={14} color={iconColor} />}
                        <Text className={`${badgeColor} font-bold text-sm`}>{item.label}</Text>
                        
                        {(isMatched || isPlanned) ? (
                          <View className="bg-emerald-100/50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md border border-emerald-200/30 dark:border-emerald-800/20">
                            <Text className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">Rutina</Text>
                          </View>
                        ) : (
                          <View className="bg-indigo-100/50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-md border border-indigo-200/30 dark:border-indigo-800/20">
                            <Text className="text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider">Extra</Text>
                          </View>
                        )}
                      </View>

                      {!isPlanned && (
                        <TouchableOpacity onPress={() => removeDropSet(date, setId, item.id)} className="p-1">
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View className="gap-3 flex-row">
                      <View className="flex-1">
                        <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">
                          Peso {item.plannedWeight ? (
                            <Text className="text-neutral-400 dark:text-neutral-500 font-normal">
                              ({item.plannedWeight} kg)
                            </Text>
                          ) : null}
                        </Text>
                        <BottomSheetTextInput
                          selectTextOnFocus
                          keyboardType="numeric"
                          defaultValue={item.loggedWeight?.toString() || ""}
                          onChangeText={(value) =>
                            updateDropSetField(date, setId, exerciseId, item.id, "weight", value, item.plannedDropSetId)
                          }
                          placeholder={item.plannedWeight || "0"}
                          placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                          className="border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm p-2.5 text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 font-semibold"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">
                          Reps {item.plannedReps ? (
                            <Text className="text-neutral-400 dark:text-neutral-500 font-normal">
                              ({item.plannedReps})
                            </Text>
                          ) : null}
                        </Text>
                        <BottomSheetTextInput
                          selectTextOnFocus
                          keyboardType="numeric"
                          defaultValue={item.loggedReps?.toString() || ""}
                          onChangeText={(value) =>
                            updateDropSetField(date, setId, exerciseId, item.id, "reps", value, item.plannedDropSetId)
                          }
                          placeholder={item.plannedReps || "0"}
                          placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                          className="border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm p-2.5 text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 font-semibold"
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </BottomSheetScrollView>
  );
}
