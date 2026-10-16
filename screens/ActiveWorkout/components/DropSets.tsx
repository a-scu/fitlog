import { LoggedDropSet, LoggedSet } from "@/types/History";
import { DropSet as WorkoutDropSet, Set as WorkoutSet } from "@/types/Workout";
import { View } from "react-native";
import DropSet from "./DropSet";

export interface MergedDropSet {
  id: string;
  type: "matched" | "planned" | "extra";
  label: string;
  plannedWeight?: string;
  plannedReps?: string;
  loggedWeight?: number;
  loggedReps?: number;
}

const getMergedDropsets = (set: WorkoutSet, loggedSet: LoggedSet) => {
  const list: MergedDropSet[] = [];

  const plannedDS = set?.dropSets || [];
  const loggedDS = loggedSet?.dropSets || [];

  const matchedLoggedIds = new Set<string>();

  // Process planned dropsets
  plannedDS.forEach((pd: WorkoutDropSet, index: number) => {
    const matchingLogged = loggedDS.find((ld: LoggedDropSet) => ld.plannedDropSetId === pd.id);

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
      });
    } else {
      list.push({
        id: pd.id,
        type: "planned",
        label: `Dropset ${index + 1}`,
        plannedWeight: pd.weight?.value,
        plannedReps: pd.reps?.value,
      });
    }
  });

  // Process extra logged dropsets
  let extraCount = 0;
  loggedDS.forEach((ld: LoggedDropSet) => {
    if (!matchedLoggedIds.has(ld.id)) {
      extraCount++;
      list.push({
        id: ld.id,
        type: "extra",
        label: `Dropset ${plannedDS.length + extraCount}`,
        loggedWeight: ld.weight,
        loggedReps: ld.reps,
      });
    }
  });

  return list;
};

export default function DropSets({ set, loggedSet }: any) {
  const mergedDropSets = getMergedDropsets(set, loggedSet);

  if (!mergedDropSets.length) return null;

  return (
    <View className="gap-2 mt-1">
      {mergedDropSets.map((item) => (
        <DropSet key={item.id} dropSet={item} />
      ))}
    </View>
  );
}
