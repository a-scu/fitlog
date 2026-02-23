import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { Ionicons } from "@expo/vector-icons";

import { useFilters } from "@/stores/FiltersStore";
import { useTranslation } from "react-i18next";

import BODY_PARTS from "@/assets/data/bodyparts.json";
import EQUIPMENTS from "@/assets/data/equipments.json";
import MUSCLES from "@/assets/data/muscles.json";
import { memo, useEffect, useState } from "react";

export const filterCategories = ["bodyParts", "equipments", "muscles"] as const;

const Filters = () => {
  const showFilters = useFilters((state) => state.showFilters);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    if (showFilters) {
      setHasBeenShown(true);
    }
  }, [showFilters]);

  if (!hasBeenShown && !showFilters) return null;

  return (
    <View className={`pb-1 ${showFilters ? "flex" : "hidden"}`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1 px-3 items-center">
        {filterCategories.map((filter) => (
          <FilterOption key={filter} option={filter} />
        ))}

        <ClearFiltersButton />
      </ScrollView>

      <FilterOptionsScroll category={"bodyParts"} cols={1} />
      <FilterOptionsScroll category={"equipments"} cols={2} />
      <FilterOptionsScroll category={"muscles"} cols={3} />
    </View>
  );
};

const ClearFiltersButton = () => {
  const search = useFilters((state) => state.search);
  const bodyParts = useFilters((state) => state.bodyParts);
  const equipments = useFilters((state) => state.equipments);
  const muscles = useFilters((state) => state.muscles);
  const resetFilters = useFilters((state) => state.resetFilters);

  const filtersActive = search !== "" || bodyParts !== "" || equipments !== "" || muscles !== "";

  if (!filtersActive) return null;

  return (
    <TouchableOpacity onPress={resetFilters} className="items-center pr-4 pl-3 py-3 justify-center">
      {/* <Ionicons name="trash-outline" className="!text-xl !text-neutral-400" /> */}
      <Text className="text-xs text-neutral-400 font-medium">LIMPIAR</Text>
    </TouchableOpacity>
  );
};

// region FILTER OPTIONS SCROLL

interface FilterScrollProps {
  category: (typeof filterCategories)[number];
  cols?: number;
}

const FilterOptionsScroll = memo(({ category, cols = 1 }: FilterScrollProps) => {
  const isExpanded = useFilters((state) => state.expandedFilter === category);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setHasBeenOpened(true);
    }
  }, [isExpanded]);

  if (!hasBeenOpened && !isExpanded) return null;

  const data = category === "bodyParts" ? BODY_PARTS : category === "equipments" ? EQUIPMENTS : MUSCLES;

  return (
    <MasonryList
      horizontal
      showsHorizontalScrollIndicator={false}
      numColumns={cols}
      data={data}
      renderItem={({ item, i }) => <FilterOptionScrollItem item={item as string} index={i} category={category} numCols={cols} />}
      keyExtractor={(item) => item as string}
      contentContainerClassName="pr-2 pl-3"
      className={`${isExpanded ? "flex mt-2" : "hidden"}`}
    />
  );
});

// region FILTER OPTION

interface FilterOptionProps {
  option: (typeof filterCategories)[number];
}

const FilterOption = ({ option }: FilterOptionProps) => {
  const expandedFilter = useFilters((state) => state.expandedFilter);
  const setExpandedFilter = useFilters((state) => state.setExpandedFilter);
  const activeValue = useFilters((state) => state[option]);
  const { t } = useTranslation();

  const isSelected = expandedFilter === option;
  const hasActiveFilter = activeValue !== "";

  const handleExpand = () => {
    setExpandedFilter(option === expandedFilter ? null : option);
  };

  return (
    <TouchableOpacity
      onPress={handleExpand}
      className={`rounded-md flex-row items-center gap-1 justify-center pl-4 pr-3 border py-3 ${isSelected ? "border-red-200" : hasActiveFilter ? "bg-red-50 border-red-200" : "border-neutral-200"}`}
    >
      <Text className={`text-sm ${isSelected ? "text-red-400" : hasActiveFilter ? "text-red-400" : "text-neutral-400"}`}>
        {hasActiveFilter && !isSelected ? t(`${option}.options.${activeValue}`) : t(`${option}.label`)}
      </Text>
      <Ionicons name="chevron-down" className={`!text-xs ${isSelected ? "!text-red-400 rotate-180" : hasActiveFilter ? "!text-red-400" : "!text-neutral-400"}`} />
    </TouchableOpacity>
  );
};

interface FilterOptionScrollItemProps {
  item: string;
  index: number;
  category: (typeof filterCategories)[number];
  numCols: number;
}

import { useShallow } from "zustand/react/shallow";

// ... (rest of the code before)

const FilterOptionScrollItem = memo(({ item, index, category, numCols }: FilterOptionScrollItemProps) => {
  const { isSelected, isSelectedInOtherCategory, setField } = useFilters(
    useShallow((state) => ({
      isSelected: state[category] === item,
      isSelectedInOtherCategory:
        state.expandedFilter === category &&
        ((category !== "bodyParts" && state.bodyParts === item) || (category !== "equipments" && state.equipments === item) || (category !== "muscles" && state.muscles === item)),
      setField: state.setField,
    })),
  );

  const { t } = useTranslation();

  const multipleColumns = numCols > 1;
  const isInLastColumn = index % numCols === numCols - 1;

  const handleSelect = () => {
    if (isSelectedInOtherCategory) return;
    setField(category, isSelected ? "" : item);
  };

  return (
    <TouchableOpacity
      onPress={handleSelect}
      disabled={isSelectedInOtherCategory}
      className={`${multipleColumns && isInLastColumn ? "mr-1" : multipleColumns ? "mb-1 mr-1" : "mr-1"} rounded-md items-center gap-2 px-4 border py-3 ${
        isSelected ? "border-red-200" : isSelectedInOtherCategory ? "opacity-50 bg-white border-neutral-200" : "bg-white border-neutral-200"
      }`}
    >
      <Text className={`text-xs ${isSelected ? "text-red-400" : "text-neutral-400"}`}>{t(`${category}.options.${item}`)}</Text>
    </TouchableOpacity>
  );
});

export default Filters;
