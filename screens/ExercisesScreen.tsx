import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, TextInput, View, Keyboard, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useMemo, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useFilters } from "@/stores/FiltersStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import Filters from "@/components/exercises/Filters";
import ExerciseItem from "@/components/exercises/ExerciseItem";

import EXERCISES from "@/assets/data/exercises.json";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { isSameDay } from "date-fns";
import { randomId } from "@/utils/random";

export default function ExercisesScreen({ navigation, route }: any) {
  const workoutSessionDate = route?.params?.workoutSessionDate;

  const addSet = useWorkoutsStore((state) => state.addSet);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const workoutSessions = useWorkoutsHistoryStore((s) => s.workoutSessions);
  const updateWorkoutSessionField = useWorkoutsHistoryStore((state) => state.updateWorkoutSessionField);

  const addSelectedToRoutine = () => {
    selectedIds.forEach((id) => addSet(id, {}));
    navigation.goBack();

    if (workoutSessionDate) {
      const workoutSession = workoutSessions.find((ws) => isSameDay(ws.date, workoutSessionDate));
      const currentSets = workoutSession?.sets || [];

      const newSets = selectedIds.map((id) => ({
        exerciseId: id,
        weight: "",
        reps: "",
        rir: "",
        id: randomId(),
        type: "effective",
        completed: true,
        dropSets: [],
        partialReps: "",
      }));

      updateWorkoutSessionField(workoutSessionDate, "sets", [...currentSets, ...newSets] as any);
    }
  };

  const search = useFilters((state) => state.search);

  return (
    <View className="bg-white mt-24 flex-1 rounded-3xl">
      {/* Grabber */}
      <View className="w-full pt-4 items-center justify-center">
        <View className="h-1 w-8 rounded-full bg-neutral-300" />
      </View>

      <View className="h-14 pb-3 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-4 items-center justify-center">
          <Ionicons name="arrow-back" className="!text-xl left-px !text-neutral-800" />
        </TouchableOpacity>
        <Text className="text-xl font-medium text-neutral-800">Agregar ejercicios</Text>
      </View>

      <ExerciseList
        workoutSessionDate={workoutSessionDate}
        search={search}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />

      {selectedIds.length > 0 && (
        <View className="absolute bottom-4 w-full px-4">
          <TouchableOpacity onPress={addSelectedToRoutine} className="bg-black p-5 rounded-lg shadow-lg">
            <Text className="text-white text-center font-medium text-lg">Agregar {selectedIds.length} ejercicios</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

interface ExerciseListProps {
  search: string;
  selectedIds: string[];
  setSelectedIds: any;
  workoutSessionDate?: string;
}

const ExerciseList = ({ workoutSessionDate, search, selectedIds, setSelectedIds }: ExerciseListProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const setField = useFilters((state) => state.setField);
  const showFilters = useFilters((state) => state.showFilters);
  const setShowFilters = useFilters((state) => state.setShowFilters);
  const inputRef = useRef<TextInput>(null);

  const [isReady, setIsReady] = useState(true);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsReady(true);
  //   }, 200);
  // }, []);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const bodyParts = useFilters((state) => state.bodyParts);
  const equipments = useFilters((state) => state.equipments);
  const muscles = useFilters((state) => state.muscles);

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((exercise) => {
      if (search) {
        const searchWords = search.toLowerCase().trim().split(/\s+/);
        const exerciseName = exercise.name.toLowerCase();
        const matchesSearch = searchWords.every((word) => exerciseName.includes(word));
        if (!matchesSearch) return false;
      }
      if (bodyParts && !exercise.bodyParts.includes(bodyParts)) return false;
      if (equipments && !exercise.equipments.includes(equipments)) return false;
      if (muscles && !exercise.targetMuscles.includes(muscles) && !exercise.secondaryMuscles.includes(muscles))
        return false;

      return true;
    });
  }, [search, bodyParts, equipments, muscles]);

  const onToggle = (item: any) => {
    setSelectedIds((prev: any) =>
      prev.includes(item.exerciseId) ? prev.filter((i: any) => i !== item.exerciseId) : [...prev, item.exerciseId],
    );
  };

  const renderItem = useMemo(
    () =>
      ({ item }: { item: any }) =>
        isReady ? (
          <ExerciseItem
            exercise={item}
            selected={selectedIds.includes(item.exerciseId)}
            onToggle={() => onToggle(item)}
          />
        ) : (
          <View className="size-40"></View>
        ),
    [selectedIds, isReady],
  );

  return (
    <View className="flex-1 items-center">
      <FlatList
        className="w-full"
        numColumns={2}
        data={filteredExercises}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        keyExtractor={(item: any) => item.exerciseId}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <View className="flex-row pb-2">
              <View className="flex-row items-center flex-1 gap-2 border border-neutral-200 rounded-md">
                <TextInput
                  ref={inputRef}
                  style={{ includeFontPadding: false }}
                  placeholder={t("screens.exercises.search") + " " + t("screens.tabs.exercises").toLowerCase()}
                  className="flex-1 p-4 text-base text-neutral-800 placeholder:text-neutral-400"
                  value={search}
                  onChangeText={(text) => setField("search", text)}
                  cursorColor={"#a3a3a380"}
                  selectionColor={"#a3a3a340"}
                  selectionHandleColor={"#a3a3a380"}
                  selectTextOnFocus
                />
                <Ionicons pointerEvents="none" name="search-outline" className="!text-xl !text-neutral-400 right-3" />
              </View>

              {/* <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className="px-4 items-center justify-center"
              >
                <Ionicons name="filter" className={`!text-xl ${showFilters ? "!text-red-400" : "!text-neutral-400"}`} />
              </TouchableOpacity> */}
            </View>

            {/* <Filters /> */}
          </View>
        }
        showsVerticalScrollIndicator={false}
        columnWrapperClassName="gap-1.5"
        contentContainerClassName="p-3 pt-0 gap-1.5"
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        ListEmptyComponent={() => (
          <View className="items-center py-12">
            <Text className="text-center max-w-xs text-neutral-400">{t("screens.exercises.noExercisesFound")}</Text>
          </View>
        )}
      />
    </View>
  );
};
