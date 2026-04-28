import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlatList, Text, TextInput, View, Keyboard, TouchableOpacity } from "react-native";
import { useMemo, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useFilters } from "@/stores/FiltersStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import Filters from "@/components/exercises/Filters";
import ExerciseItem from "@/components/exercises/ExerciseItem";

import EXERCISES from "@/assets/data/exercises.json";

export default function ExercisesScreen({ navigation }: any) {
  const addSet = useWorkoutsStore((state) => state.addSet);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addSelectedToRoutine = () => {
    selectedIds.forEach((id) => addSet(id, {}));
    navigation.goBack();
  };

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const search = useFilters((state) => state.search);
  const setField = useFilters((state) => state.setField);
  const showFilters = useFilters((state) => state.showFilters);
  const setShowFilters = useFilters((state) => state.setShowFilters);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", () => {
      inputRef.current?.blur();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={{ paddingTop: insets.top }} className="bg-white flex-1">
      <View className="pt-3 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-4 items-center justify-center">
          <Ionicons name="arrow-back" className="!text-xl left-px !text-neutral-800" />
        </TouchableOpacity>
        <Text className="text-xl font-medium text-neutral-800">Agregar ejercicios</Text>
      </View>

      <View className="pt-3 pl-3 mb-2 flex-row">
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

        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className="px-4 items-center justify-center">
          <Ionicons name="filter" className={`!text-xl ${showFilters ? "!text-red-400" : "!text-neutral-400"}`} />
        </TouchableOpacity>
      </View>

      <ExerciseList search={search} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />

      {selectedIds.length > 0 && (
        <View className="absolute bottom-10 w-full px-4">
          <TouchableOpacity onPress={addSelectedToRoutine} className="bg-red-500 p-4 rounded-xl shadow-lg">
            <Text className="text-white text-center font-bold text-lg">Agregar {selectedIds.length} ejercicios</Text>
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
}

const ExerciseList = ({ search, selectedIds, setSelectedIds }: ExerciseListProps) => {
  const { t } = useTranslation();
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

  const renderItem = useMemo(
    () =>
      ({ item }: { item: any }) => (
        <ExerciseItem
          exercise={item}
          selected={selectedIds.includes(item.exerciseId)}
          onToggle={() =>
            setSelectedIds((prev: any) =>
              prev.includes(item.exerciseId)
                ? prev.filter((i: any) => i !== item.exerciseId)
                : [...prev, item.exerciseId],
            )
          }
          selectionMode={selectedIds.length > 0}
        />
      ),
    [selectedIds],
  );

  return (
    <View className="flex-1 items-center">
      <FlatList
        className="w-full"
        numColumns={2}
        data={filteredExercises}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        keyExtractor={(item: any) => item.exerciseId}
        renderItem={renderItem}
        ListHeaderComponent={<Filters />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-2"
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
