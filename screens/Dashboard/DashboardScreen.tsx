import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { useState, useRef, memo, useCallback, useEffect } from "react";
import { scheduleOnRN } from "react-native-worklets";
import { Ionicons } from "@expo/vector-icons";
import { es } from "date-fns/locale";

import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import WorkoutQuickView from "@/components/WorkoutQuickView";
import WorkoutRecords from "@/components/WorkoutRecords";
import RoutineQuickView from "@/components/RoutineQuickView";
import RestQuickView from "@/components/RestQuickView";

import { SCREEN_WIDTH } from "@/constants/layout";
import { useNavigation } from "@react-navigation/native";
import colors from "tailwindcss/colors";
import ThisWeek from "@/components/ThisWeek";
import { getWeekId } from "@/screens/Weeks/WeeksScreen";

const TOTAL_PAGES = 1000;
const INITIAL_PAGE = 500;
const FLATLIST_DATA = Array.from({ length: TOTAL_PAGES }, (_, index) => index);

export default function DashboardScreen({ navigation }: any) {
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

  // const jumpToToday = () => {
  //   const today = startOfDay(new Date());
  //   setBaseDate(today);
  //   setCurrentPage(INITIAL_PAGE);
  //   flatListRef.current?.scrollToIndex({ index: INITIAL_PAGE, animated: false });
  // };

  useEffect(() => {
    navigation.setOptions({
      headerRight: (
        <TouchableOpacity
          className="px-4"
          onPress={() => navigation.navigate("personalWorkspaceSettings")}
        >
          <Ionicons name="settings-outline" color={colors.white} size={20} />
        </TouchableOpacity>
      ),
    });
  }, []);

  const routine = routines.find((r) => r.id === personalWorkspace.routineId);

  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  const isYesterday = isSameDay(selectedDate, addDays(today, -1));
  const isTomorrow = isSameDay(selectedDate, addDays(today, 1));

  const getHeaderText = () => {
    const dateFormatted = format(selectedDate, "EEE d 'de' MMM", {
      locale: es,
    });
    if (isToday) return `hoy - ${dateFormatted}`;
    if (isYesterday) return `ayer - ${dateFormatted}`;
    if (isTomorrow) return `mañana - ${dateFormatted}`;
    return dateFormatted;
  };

  const renderItem = useCallback(
    ({ item: index }: { item: number }) => {
      const date = addDays(baseDate, index - INITIAL_PAGE);
      return <DayContent date={date} routine={routine} />;
    },
    [baseDate, routine, SCREEN_WIDTH],
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      {/* Top Header */}
      <View className="flex-row items-center justify-between h-14 border-b border-neutral-100 dark:border-neutral-800">
        <TouchableOpacity
          onPress={jumpToPrev}
          className="h-14 px-4 justify-center items-center"
        >
          <Ionicons
            name="chevron-back-outline"
            size={18}
            className="!text-neutral-800 dark:!text-white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center gap-2.5 h-14 justify-center"
        >
          <Ionicons name="calendar-outline" size={16} color={colors.white} />
          <Text className="text-xl font-medium text-neutral-800 dark:text-white text-center">
            {getHeaderText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={jumpToNext}
          className="h-14 px-4 justify-center items-center"
        >
          <Ionicons
            name="chevron-forward-outline"
            size={18}
            className="!text-neutral-800 dark:!text-white"
          />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDatePicked}
        />
      )}

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

  const workoutSession = useWorkoutsHistoryStore((s) =>
    s.getWorkoutSession(date.toISOString()),
  );

  const isToday = isSameDay(date, new Date());

  const adjustedDayIndex = (date.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const weekId = getWeekId(date);
  const currentDays = routine?.weekOverrides?.[weekId]?.days || routine?.days;

  const plannedDay = currentDays?.[adjustedDayIndex];
  const plannedWorkout = workouts.find((w) => w.id === plannedDay?.workoutId);

  // console.log(plannedDay);

  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 gap-4 grow"
      >
        {isToday && routine && <ThisWeek date={date} routine={routine} />}

        {/* {isToday && <RoutineQuickView date={date} routine={routine} />} */}

        {isToday && plannedDay?.isRestDay ? (
          <RestQuickView routineId={routine.id} date={date} />
        ) : (
          isToday && (
            <WorkoutQuickView
              date={date}
              workout={plannedWorkout}
              isRestDay={plannedDay?.isRestDay}
            />
          )
        )}

        <WorkoutRecords date={date} workout={plannedWorkout} />

        <WorkoutNotes date={date} workoutSession={workoutSession} />
      </ScrollView>
    </View>
  );
});

const WorkoutNotes = ({ date, workoutSession }: any) => {
  const navigation = useNavigation();

  const handleAddNotes = () => {
    navigation.navigate("addNote", { date: date.toISOString() });
  };

  if (!workoutSession || !workoutSession.notes)
    return (
      <TouchableOpacity
        className="rounded-2xl w-full border-1.5 border-neutral-200 dark:border-neutral-700 border-dashed h-44 items-center justify-center gap-2.5"
        onPress={handleAddNotes}
      >
        <Ionicons name="text-outline" size={28} color={colors.neutral[400]} />
        <Text className="text-neutral-400 font-semibold text-lg">
          Agregar notas
        </Text>
      </TouchableOpacity>
    );

  return (
    <TouchableOpacity
      onPress={handleAddNotes}
      className="border-green-200 bg-green-950/25 dark:border-green-800 border border-solid rounded-2xl p-5 min-h-44"
    >
      <View className="flex-row items-center gap-1">
        <Ionicons
          name="document-text-outline"
          color={colors.neutral[400]}
          size={12}
        />
        <Text className="text-neutral-500 dark:text-neutral-400 font-medium">
          Notas
        </Text>
      </View>

      <View className="mt-4">
        <Text className="text-neutral-800 dark:text-neutral-300">
          {workoutSession.notes}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
