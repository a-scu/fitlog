import RegisterSetModal from "@/components/modals/RegisterSetModal";
import EXERCISES from "@/constants/Exercises";
import { SET_TYPES } from "@/constants/SetTypes";
import { useActiveWorkoutStore } from "@/stores/ActiveWorkoutStore";
import { useModalStore } from "@/stores/ModalStore";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { today } from "@/utils/date";
import { capitalize } from "@/utils/text";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";
import colors from "tailwindcss/colors";
import DropSets from "./DropSets";
import { Metric as WorkoutMetric, Set as WorkoutSet } from "@/types/Workout";
import { LoggedSet } from "@/types/History";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";

export default function PlannedSet({ set, index }: { set: any; index: number }) {
  const showModal = useModalStore((s) => s.showModal);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(today));
  const toggleSetCompleted = useWorkoutsHistoryStore((s) => s.toggleSetCompleted);

  const updateInteractionTime = useActiveWorkoutStore((s) => s.updateInteractionTime);

  const exercise = EXERCISES.find((e) => e.exerciseId === set.exerciseId);

  const openRegisterModal = (setId: string, exerciseId: string, plannedSet?: any) => {
    showModal({
      withBottomSheetView: false,
      content: <RegisterSetModal date={today} setId={setId} exerciseId={exerciseId} plannedSet={plannedSet} />,
    });
  };

  if (!exercise)
    return (
      <View className="p-4 flex-row items-center gap-2 bg-amber-950/25 border rounded-2xl border-amber-950">
        <Ionicons name="sad-outline" size={14} color={colors.amber[500]} />
        <Text className="text-center text-sm dark:text-amber-500">No se encontró el ejercicio</Text>
      </View>
    );

  const loggedSet = workoutSession?.sets.find((s) => s.id === set.id);

  const isCompleted = loggedSet?.completed;
  const setType = SET_TYPES.find((t) => t.id === set.type);

  const hasMetrics = set.weight?.value || set.reps?.value || set.rir?.value || loggedSet?.weight || loggedSet?.reps || loggedSet?.rir;

  const validWeight = set.weight?.value > 0 || set.weight?.min > 0 || set.weight?.max > 0 || loggedSet?.weight;
  const validReps = set.reps?.value > 0 || set.reps?.min > 0 || set.reps?.max > 0 || loggedSet?.reps;
  const validRir = set.rir?.value > 0 || set.rir?.min > 0 || set.rir?.max > 0 || loggedSet?.rir;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => openRegisterModal(set.id, set.exerciseId, set)}
      className={`p-4 border rounded-2xl gap-3 transition-colors ${
        isCompleted
          ? "border-emerald-500/40 dark:border-emerald-600/30 bg-emerald-950/25 dark:bg-emera/ld-950/10"
          : "border-neutral-200 dark:border-neutral-900 bg-neutral-50/10 dark:bg-neutral-950/10"
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 items-center flex-row gap-2">
          <Text className="font-bold text-neutral-800 dark:text-neutral-100">{capitalize(exercise.name)}</Text>

          {/* <View className="bg-emerald-100/50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200/30 dark:border-emerald-800/20">
            <Text className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">Rutina</Text>
          </View> */}

          {/* Set type */}
          {setType && (
            <View
              style={{
                backgroundColor: setType.color[500] + "15",
                borderColor: setType.color[500] + "15",
              }}
              className="px-2 py-0.5 rounded-full border"
            >
              <Text style={{ color: setType.color[500] }} className="text-[9px] font-bold uppercase">
                {setType.label}
              </Text>
            </View>
          )}
        </View>

        {/* Complete button */}
        <TouchableOpacity
          onPress={() => {
            toggleSetCompleted(today, set.id, set.exerciseId);
            updateInteractionTime();
          }}
          activeOpacity={0.7}
          className={`size-7 rounded-full items-center justify-center border ${
            isCompleted ? "bg-emerald-500 border-emerald-500" : "border-neutral-300 dark:border-neutral-600 bg-transparent"
          }`}
        >
          {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
        </TouchableOpacity>
      </View>

      {/* Metrics Table Grid */}
      {hasMetrics && (
        <View className="flex-row gap-3 bg-neutral-50/50 dark:bg-neutral-950/30 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/40 justify-between">
          {validWeight && (
            <>
              <Metric plannedMetric={set.weight} loggedMetric={loggedSet?.weight} type={"weight"} />
            </>
          )}

          {validReps && (
            <>
              <View className="bg-neutral-200/50 dark:bg-neutral-900/50 h-full w-px" />
              <Metric plannedMetric={set.reps} loggedMetric={loggedSet?.reps} type={"reps"} />
            </>
          )}

          {validRir && (
            <>
              <View className="bg-neutral-200/50 dark:bg-neutral-900/50 h-full w-px" />
              <Metric plannedMetric={set.rir} loggedMetric={loggedSet?.rir} type={"rir"} />
            </>
          )}
        </View>
      )}

      {/* DropSets Rendering */}
      <DropSets set={set} loggedSet={loggedSet} />
    </TouchableOpacity>
  );
}

const TICK_COUNT = 12;
const GREEN_EDGE_TICKS = new Set([1, 12]);

const Metric = ({ plannedMetric, loggedMetric, type }: { plannedMetric?: WorkoutMetric; loggedMetric?: number; type: "weight" | "reps" | "rir" }) => {
  const weightUnit = useGlobalSettingsStore((s) => s.weightUnit);

  // Range
  if (plannedMetric && plannedMetric.isRange) {
    const min = parseFloat(plannedMetric.min) || 0;
    const max = parseFloat(plannedMetric.max) || 0;
    const range = max - min;
    const hasLogged = loggedMetric != null;

    const greenWidth = 70;
    const redWidth = (100 - greenWidth) / 2;

    // Indicator maps into the bar's fixed zones:
    //   0–15% = left red zone, 15–85% = green zone, 85–100% = right red zone
    // A logged metric at min → redWidth%, at max → redWidth + greenWidth%
    let indicatorLeft = 50;
    if (hasLogged && range > 0) {
      const percent = (loggedMetric - min) / range; // 0 = min, 1 = max
      indicatorLeft = redWidth + percent * greenWidth;
      indicatorLeft = Math.max(2, Math.min(98, indicatorLeft));
    }

    return (
      <View className="flex-1 h-full">
        <Text className={`text-[10px] text-neutral-400 dark:text-neutral-500 font-bold text-center uppercase ${hasLogged ? "mb-1.5" : "mb-3"}`}>
          {capitalize(type)} {type === "weight" && `(${weightUnit})`}
        </Text>

        <View className="flex-1 justify-center">
          {/* Logged metric */}
          {hasLogged && (
            <Text style={{ color: colors.blue[500] }} className="text-base text-center font-bold mb-1.5">
              {loggedMetric} {type === "weight" && weightUnit}
            </Text>
          )}

          {/* Bar */}
          <View className="w-full">
            <View style={{ height: 10, borderRadius: 5, overflow: "visible", flexDirection: "row", position: "relative" }}>
              {/* Left danger zone */}
              <View
                style={{
                  width: `${redWidth}%`,
                  backgroundColor: colors.red[500] + "30",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 0,
                }}
                className="rounded-l-2xl"
              >
                <Ionicons name="remove-outline" size={8} color={colors.red[500]} />
              </View>

              {/* Target range */}
              <View
                style={{
                  width: `${greenWidth}%`,
                  backgroundColor: `${colors.emerald[500]}50`,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderWidth: 0,
                  }}
                >
                  {Array.from({ length: TICK_COUNT }).map((_, i) => {
                    const isEdge = GREEN_EDGE_TICKS.has(i + 1);
                    return (
                      <View
                        key={i}
                        style={{
                          width: 1,
                          height: isEdge ? 10 : "45%",
                          backgroundColor: isEdge ? colors.transparent : colors.emerald[800] + "80",
                        }}
                      />
                    );
                  })}
                </View>
              </View>

              {/* Right danger zone */}
              <View
                style={{
                  width: `${redWidth}%`,
                  backgroundColor: colors.red[500] + "30",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 0,
                }}
                className="rounded-r-2xl"
              >
                <Ionicons name="add-outline" size={8} color={colors.red[500]} />
              </View>

              {/* Logged metric indicator */}
              {hasLogged && (
                <View
                  style={{
                    position: "absolute",
                    left: `${indicatorLeft}%`,
                    top: -2,
                    width: 1,
                    height: 14,
                    backgroundColor: colors.blue[500],
                  }}
                />
              )}
            </View>
          </View>

          {/* Min/Max */}
          <View style={{ position: "relative", marginTop: 6, height: 10 }}>
            <View style={{ position: "absolute", left: `${redWidth}%`, width: 40, marginLeft: -20, alignItems: "center" }}>
              <Text className="text-xs font-bold text-emerald-500 dark:text-neutral-200 mt-0.5 leading-none">{plannedMetric.min}</Text>
            </View>
            <View style={{ position: "absolute", left: `${redWidth + greenWidth}%`, width: 40, marginLeft: -20, alignItems: "center" }}>
              <Text className="text-xs font-bold text-emerald-500 dark:text-neutral-200 mt-0.5 leading-none">{plannedMetric.max}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Single
  if (plannedMetric) {
    const displayMetric = loggedMetric != null ? `${loggedMetric}` : plannedMetric.value || "—";
    const showPlanDiff = plannedMetric.value && loggedMetric != null && String(loggedMetric) !== String(plannedMetric.value);

    return (
      <View className="items-center flex-1">
        <Text className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-1.5 font-bold uppercase">
          {capitalize(type)} {type === "weight" && `(${weightUnit})`}
        </Text>

        <View className="flex-1 items-center justify-center">
          {showPlanDiff && (
            <Text className="text-base text-center font-bold dark:text-blue-500">
              {plannedMetric.value} {type === "weight" && weightUnit}
            </Text>
          )}

          <Text className={`text-neutral-800 dark:text-neutral-200 ${showPlanDiff ? "line-through text-xs font-semibold" : "text-base font-bold"}`}>
            {displayMetric} {type === "weight" && weightUnit}
          </Text>
        </View>
      </View>
    );
  }
};
