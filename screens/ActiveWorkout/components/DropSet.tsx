import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { emerald, indigo, neutral } from "tailwindcss/colors";
import { MergedDropSet } from "./DropSets";

const getColors = (isMatched: boolean, isPlanned: boolean, isExtra: boolean) => {
  let borderStyle = "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30";
  let badgeColor = "text-neutral-500 dark:text-neutral-400";
  let iconColor: string = neutral[500];
  let iconName = "ellipse-outline";

  if (isMatched) {
    borderStyle = "border-emerald-500/30 dark:border-emerald-600/20 bg-emerald-50/10 dark:bg-emerald-950/5";
    badgeColor = "text-emerald-600 dark:text-emerald-400 font-bold";
    iconColor = emerald[600];
    iconName = "checkmark-circle-outline";
  } else if (isPlanned) {
    borderStyle = "border-neutral-300 dark:border-neutral-900 bg-neutral-50/10 dark:bg-neutral-900/25";
    badgeColor = "text-neutral-400 dark:text-neutral-500 font-semibold";
  } else if (isExtra) {
    borderStyle = "border-indigo-500/20 dark:border-indigo-600/15 bg-indigo-50/5 dark:bg-indigo-950/5";
    badgeColor = "text-indigo-600 dark:text-indigo-400 font-bold";
    iconColor = indigo[600];
    iconName = "add-circle-outline";
  }

  return {
    borderStyle,
    badgeColor,
    iconColor,
    iconName,
  };
};

export default function DropSet({ dropSet }: { dropSet: MergedDropSet }) {
  const isMatched = dropSet.type === "matched";
  const isPlanned = dropSet.type === "planned";
  const isExtra = dropSet.type === "extra";

  const { borderStyle, badgeColor, iconColor, iconName } = getColors(isMatched, isPlanned, isExtra);

  return (
    <View key={dropSet.id} className={`flex-row border rounded-xl p-3 items-center justify-between ${borderStyle}`}>
      <View className="flex-row items-center gap-1.5">
        {!isPlanned && <Ionicons name={iconName as any} size={14} color={iconColor} />}
        <Text className={`text-xs ${badgeColor}`}>{dropSet.label}</Text>

        {isMatched || isPlanned ? (
          <View className="bg-emerald-100/50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md border border-emerald-200/30 dark:border-emerald-800/20">
            <Text className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">Rutina</Text>
          </View>
        ) : (
          <View className="bg-indigo-100/50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-md border border-indigo-200/30 dark:border-indigo-800/20">
            <Text className="text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase">Extra</Text>
          </View>
        )}
      </View>

      {isMatched && (
        <View className="flex-row items-center gap-2.5">
          <Text className="text-[10px] text-neutral-400 dark:text-neutral-500">
            Plan: {dropSet.plannedWeight || "—"} kg × {dropSet.plannedReps || "—"}
          </Text>
          <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            {dropSet.loggedWeight !== undefined ? `${dropSet.loggedWeight} kg` : "—"} × {dropSet.loggedReps !== undefined ? dropSet.loggedReps : "—"}
          </Text>
        </View>
      )}

      {isPlanned && (
        <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold italic">
          Plan: {dropSet.plannedWeight || "—"} kg × {dropSet.plannedReps || "—"}
        </Text>
      )}

      {isExtra && (
        <Text className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
          {dropSet.loggedWeight !== undefined ? `${dropSet.loggedWeight} kg` : "—"} × {dropSet.loggedReps !== undefined ? dropSet.loggedReps : "—"}
        </Text>
      )}
    </View>
  );
}
