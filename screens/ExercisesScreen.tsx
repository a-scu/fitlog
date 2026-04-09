import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FlatList,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useFilters } from "@/stores/FiltersStore";

import Filters from "@/components/exercises/Filters";
import ExerciseItem from "@/components/exercises/ExerciseItem";

import EXERCISES from "@/assets/data/exercises.json";

export default function ExercisesScreen({ navigation }) {
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="px-4 items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            className="!text-xl left-px !text-neutral-800"
          />
        </TouchableOpacity>
        <Text className="text-xl font-medium text-neutral-800">
          Agregar ejercicios
        </Text>
      </View>

      <View className="pt-3 pl-3 mb-2 flex-row">
        <View className="flex-row items-center flex-1 gap-2 border border-neutral-200 rounded-md">
          <TextInput
            ref={inputRef}
            style={{ includeFontPadding: false }}
            placeholder={
              t("screens.exercises.search") +
              " " +
              t("screens.tabs.exercises").toLowerCase()
            }
            className="flex-1 p-4 text-base text-neutral-800 placeholder:text-neutral-400"
            value={search}
            onChangeText={(text) => setField("search", text)}
            cursorColor={"#a3a3a380"}
            selectionColor={"#a3a3a340"}
            selectionHandleColor={"#a3a3a380"}
            selectTextOnFocus
          />
          <Ionicons
            pointerEvents="none"
            name="search-outline"
            className="!text-xl !text-neutral-400 right-3"
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="px-4 items-center justify-center"
        >
          <Ionicons
            name="filter"
            className={`!text-xl ${showFilters ? "!text-red-400" : "!text-neutral-400"}`}
          />
        </TouchableOpacity>
      </View>

      <ExerciseList search={search} />
    </View>
  );
}

interface ExerciseListProps {
  search: string;
}

const ExerciseList = ({ search }: ExerciseListProps) => {
  const { t } = useTranslation();
  const bodyParts = useFilters((state) => state.bodyParts);
  const equipments = useFilters((state) => state.equipments);
  const muscles = useFilters((state) => state.muscles);

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((exercise) => {
      if (search) {
        const searchWords = search.toLowerCase().trim().split(/\s+/);
        const exerciseName = exercise.name.toLowerCase();
        const matchesSearch = searchWords.every((word) =>
          exerciseName.includes(word),
        );
        if (!matchesSearch) return false;
      }
      if (bodyParts && !exercise.bodyParts.includes(bodyParts)) return false;
      if (equipments && !exercise.equipments.includes(equipments)) return false;
      if (
        muscles &&
        !exercise.targetMuscles.includes(muscles) &&
        !exercise.secondaryMuscles.includes(muscles)
      )
        return false;

      return true;
    });
  }, [search, bodyParts, equipments, muscles]);

  const renderItem = useMemo(
    () =>
      ({ item }: { item: any }) => <ExerciseItem exercise={item} />,
    [],
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
            <Text className="text-center max-w-xs text-neutral-400">
              {t("screens.exercises.noExercisesFound")}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

// const PAGE_SIZE = 15;

// const [itemsLimit, setItemsLimit] = useState(PAGE_SIZE);
// const [isLoading, setIsLoading] = useState(false);

// useEffect(() => {
//   setItemsLimit(PAGE_SIZE);
// }, [search, bodyParts, equipments, muscles]);

// const dataToShow = useMemo(() => (filteredExercises.slice(0, itemsLimit)), [filteredExercises, itemsLimit]);

// const onEndReached = () => {
//   if (isLoading || dataToShow.length >= filteredExercises.length) return;

//   setIsLoading(true);
//   // Simulamos un pequeño delay para que la transición sea suave y el footer sea visible
//   setItemsLimit((prev) => prev + PAGE_SIZE);
//   setIsLoading(false);
// };

//  ListFooterComponent={() =>
//     isLoading ? (
//       <View className="w-full px-4 py-6 justify-center items-center">
//         <Image source={require("@/assets/images/loading.gif")} style={{ width: 32, height: 32 }} />
//       </View>
//     ) : null
//   }
// onEndReached={onEndReached}
