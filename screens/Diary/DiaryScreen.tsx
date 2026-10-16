import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { useState, useRef, memo, useCallback } from "react";
import { scheduleOnRN } from "react-native-worklets";
import { Ionicons } from "@expo/vector-icons";
import { es } from "date-fns/locale";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import WorkoutOverview from "@/components/WorkoutOverview";
import WorkoutRecords from "@/components/WorkoutRecords";

import { SCREEN_WIDTH } from "@/constants/Layout";
import { useNavigation } from "@react-navigation/native";
import colors from "tailwindcss/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWeekId } from "@/screens/Weeks/WeeksScreen";
import { getAdjustedDayIndex } from "@/utils/date";

const TOTAL_PAGES = 1000;
const INITIAL_PAGE = 500;
const FLATLIST_DATA = Array.from({ length: TOTAL_PAGES }, (_, index) => index);

export default function DiaryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const personalWorkspace = useWorkspacesStore((s) => s.personalWorkspace);
  const routines = useRoutinesStore((state) => state.routines);

  const [baseDate, setBaseDate] = useState(startOfDay(new Date()));
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const flatListRef = useRef<Animated.FlatList<any>>(null);

  const selectedDate = addDays(baseDate, currentPage - INITIAL_PAGE);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const offset = e.contentOffset.x;
      const index = Math.round(offset / SCREEN_WIDTH);
      if (index !== currentPage) {
        scheduleOnRN(setCurrentPage, index);
      }
    },
  });

  const handleDatePicked = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const selected = startOfDay(date);
      setBaseDate(selected);
      setCurrentPage(INITIAL_PAGE);
      flatListRef.current?.scrollToIndex({
        index: INITIAL_PAGE,
        animated: false,
      });
    }
  };

  const jumpToNext = () => {
    flatListRef.current?.scrollToIndex({
      index: currentPage + 1,
      animated: true,
    });
  };

  const jumpToPrev = () => {
    flatListRef.current?.scrollToIndex({
      index: currentPage - 1,
      animated: true,
    });
  };

  const jumpToToday = () => {
    const today = startOfDay(new Date());
    setBaseDate(today);
    setCurrentPage(INITIAL_PAGE);
    flatListRef.current?.scrollToIndex({
      index: INITIAL_PAGE,
      animated: false,
    });
  };

  const routine = routines.find((r) => r.id === personalWorkspace.routineId);

  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  const isYesterday = isSameDay(selectedDate, addDays(today, -1));
  const isTomorrow = isSameDay(selectedDate, addDays(today, 1));

  const getHeaderText = () => {
    const dateFormatted = format(selectedDate, "EEE d 'de' MMM", {
      locale: es,
    });
    if (isToday) return `Hoy - ${dateFormatted}`;
    if (isYesterday) return `Ayer - ${dateFormatted}`;
    if (isTomorrow) return `Mañana - ${dateFormatted}`;
    return dateFormatted;
  };

  const renderItem = useCallback(
    ({ item: index }: { item: number }) => {
      const date = addDays(baseDate, index - INITIAL_PAGE);
      return <DayContent date={date} routine={routine} />;
    },
    [baseDate, routine],
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between h-14 border-b border-neutral-100 dark:border-neutral-800 px-2">
        <TouchableOpacity onPress={jumpToPrev} className="h-14 w-12 justify-center items-center">
          <Ionicons name="chevron-back-outline" size={22} className="!text-neutral-800 dark:!text-white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center gap-2 h-14 justify-center flex-1">
          <Ionicons name="calendar-outline" size={18} className="!text-neutral-800 dark:!text-white" />
          <Text className="text-lg font-bold text-neutral-800 dark:text-white text-center capitalize">{getHeaderText()}</Text>
        </TouchableOpacity>

        {!isToday ? (
          <TouchableOpacity onPress={jumpToToday} className="h-14 px-3 justify-center items-center flex-row gap-1">
            <Text className="text-red-400 font-bold text-sm">Hoy</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-12 h-14" />
        )}

        <TouchableOpacity onPress={jumpToNext} className="h-14 w-12 justify-center items-center">
          <Ionicons name="chevron-forward-outline" size={22} className="!text-neutral-800 dark:!text-white" />
        </TouchableOpacity>
      </View>

      {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDatePicked} />}

      {/* Infinite FlatList Swiper */}
      <Animated.FlatList
        ref={flatListRef}
        horizontal
        decelerationRate="fast"
        initialScrollIndex={INITIAL_PAGE}
        onScroll={scrollHandler}
        data={FLATLIST_DATA}
        keyExtractor={(item) => item.toString()}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        disableIntervalMomentum
        nestedScrollEnabled
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={false}
        renderItem={renderItem}
      />
    </View>
  );
}

const DayContent = memo(({ date, routine }: { date: Date; routine: any }) => {
  const workouts = useWorkoutsStore((s) => s.workouts);

  const workoutSession = useWorkoutsHistoryStore((s) => s.getWorkoutSession(date.toISOString()));

  const adjustedDayIndex = getAdjustedDayIndex(date);
  const weekId = getWeekId(date);
  const currentDays = routine?.weekOverrides?.[weekId]?.days || routine?.days;

  const plannedDay = currentDays?.[adjustedDayIndex];
  const plannedWorkout = workouts.find((w) => w.id === plannedDay?.workoutId);

  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4 gap-4 grow">
        <WorkoutRecords date={date} workout={plannedWorkout} />
        <WorkoutNotes date={date} workoutSession={workoutSession} />
      </ScrollView>
    </View>
  );
});

const WorkoutNotes = ({ date, workoutSession }: any) => {
  const navigation = useNavigation<any>();

  const [textHeight, setTextHeight] = useState(0);

  const handleAddNotes = () => {
    navigation.navigate("addNote", { date: date.toISOString() });
  };

  if (!workoutSession || !workoutSession.notes)
    return (
      <TouchableOpacity
        className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed h-44 items-center justify-center"
        onPress={handleAddNotes}
      >
        <Ionicons name="text-outline" size={28} color={colors.neutral[400]} />
        <Text className="text-neutral-400 font-medium text-lg">Agregar notas</Text>
      </TouchableOpacity>
    );

  const LINE_HEIGHT = 32;
  const PADDING_TOP = 10;
  const PADDING_BOTTOM = 24;
  const LINE_OFFSET = 23; // Fine-tune this offset to align text perfectly on the line
  const MIN_LINES = 5;

  const textLines = textHeight > 0 ? Math.round(textHeight / LINE_HEIGHT) : 1;
  const displayLines = Math.max(MIN_LINES, textLines);
  const containerHeight = displayLines * LINE_HEIGHT + PADDING_TOP + PADDING_BOTTOM;

  return (
    <TouchableOpacity
      onPress={handleAddNotes}
      activeOpacity={0.85}
      style={{ height: containerHeight }}
      className="border-green-300 bg-[#FFFDF7] dark:bg-[#18181C] dark:border-sky-900 border-1.5 border-solid rounded-2xl shadow-sm overflow-hidden"
    >
      <View
        style={{
          flex: 1,
          paddingTop: PADDING_TOP,
          paddingBottom: PADDING_BOTTOM,
        }}
        className="relative"
      >
        {/* Lined paper background horizontal lines */}
        <View className="absolute inset-0">
          {Array.from({ length: displayLines }).map((_, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                top: i * LINE_HEIGHT + PADDING_TOP + LINE_OFFSET,
                left: 0,
                right: 0,
                height: 1,
              }}
              className="bg-sky-100 dark:bg-sky-950"
            />
          ))}
        </View>

        {/* Note Text */}
        <Text
          allowFontScaling={false}
          onLayout={(e) => {
            setTextHeight(e.nativeEvent.layout.height);
          }}
          style={{
            fontSize: 12,
            lineHeight: LINE_HEIGHT,
            paddingLeft: 12,
            paddingRight: 12,
            includeFontPadding: false,
          }}
          className="text-start text-neutral-800 dark:text-neutral-300 font-normal"
        >
          {workoutSession.notes}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
