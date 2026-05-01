import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";

import { Ionicons } from "@expo/vector-icons";

import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import colors from "tailwindcss/colors";

import WorkoutQuickView from "@/components/WorkoutQuickView";

import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

import { useState, useRef, memo, useCallback } from "react";
import RoutineQuickView from "@/components/RoutineQuickView";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { useAnimatedScrollHandler, runOnJS } from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import { SWIPER_CONFIG } from "@/constants/SwiperConfig";
import RestQuickView from "@/components/RestQuickView";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import WorkoutSessionView from "../EditWorkout/components/WorkoutSessionView";
import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";

const TOTAL_PAGES = 1000;
const INITIAL_PAGE = 500;
const DATES_DATA = Array.from({ length: TOTAL_PAGES }, (_, index) => index);

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const getPersonalWorkspace = useWorkspacesStore((state) => state.getPersonalWorkspace);
  const personalWorkspace = getPersonalWorkspace();

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
        runOnJS(setCurrentPage)(index);
      }
    },
  });

  const handleDatePicked = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const selected = startOfDay(date);
      setBaseDate(selected);
      setCurrentPage(INITIAL_PAGE);
      flatListRef.current?.scrollToIndex({ index: INITIAL_PAGE, animated: false });
    }
  };

  const jumpToNext = () => {
    flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
  };

  const jumpToPrev = () => {
    flatListRef.current?.scrollToIndex({ index: currentPage - 1, animated: true });
  };

  // const jumpToToday = () => {
  //   const today = startOfDay(new Date());
  //   setBaseDate(today);
  //   setCurrentPage(INITIAL_PAGE);
  //   flatListRef.current?.scrollToIndex({ index: INITIAL_PAGE, animated: false });
  // };

  if (!personalWorkspace) return null;

  const { routineId } = personalWorkspace;

  const routine = routines.find((r) => r.id === routineId);

  const renderItem = useCallback(
    ({ item: index }: { item: number }) => {
      const date = addDays(baseDate, index - INITIAL_PAGE);
      return <DayContent date={date} routine={routine} navigation={navigation} />;
    },
    [baseDate, routine, navigation, SCREEN_WIDTH],
  );

  if (!routineId || !routine) {
    const handleCreateRoutine = () => {
      navigation.navigate("createRoutine");
    };

    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <ScrollView className="flex-1" contentContainerClassName="p-3">
          <TouchableOpacity onPress={handleCreateRoutine} className="p-6 border rounded-md">
            <Text>Crear rutina</Text>
          </TouchableOpacity>

          <Text>Aun no creaste ninguna rutina</Text>
        </ScrollView>
      </View>
    );
  }

  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  const isYesterday = isSameDay(selectedDate, addDays(today, -1));
  const isTomorrow = isSameDay(selectedDate, addDays(today, 1));

  const getHeaderText = () => {
    const dateFormatted = format(selectedDate, "EEE d 'de' MMM", { locale: es });
    if (isToday) return `hoy - ${dateFormatted}`;
    if (isYesterday) return `ayer - ${dateFormatted}`;
    if (isTomorrow) return `mañana - ${dateFormatted}`;
    return dateFormatted;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center justify-between h-14 border-b border-neutral-100">
        <TouchableOpacity onPress={jumpToPrev} className="h-14 px-4 justify-center items-center">
          <Ionicons name="chevron-back-outline" size={18} color={colors.neutral[800]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center gap-1 h-14 justify-center"
        >
          <Text className="text-xl font-medium text-neutral-800 text-center">{getHeaderText()}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={jumpToNext} className="h-14 px-4 justify-center items-center">
          <Ionicons name="chevron-forward-outline" size={18} color={colors.neutral[800]} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker value={selectedDate} mode="date" display="default" onChange={handleDatePicked} />
      )}

      {/* Infinite FlatList Swiper */}
      <Animated.FlatList
        ref={flatListRef}
        horizontal
        decelerationRate="fast"
        initialScrollIndex={INITIAL_PAGE}
        onScroll={scrollHandler}
        data={DATES_DATA}
        keyExtractor={(item) => item.toString()}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        disableIntervalMomentum
        nestedScrollEnabled
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={false} // Disable to avoid disappearing content bugs
        renderItem={renderItem}
      />
    </View>
  );
}

const DayContent = memo(({ date, routine, navigation }: { date: Date; routine: any; navigation: any }) => {
  const workouts = useWorkoutsStore((s) => s.workouts);

  const isToday = isSameDay(date, new Date());

  const adjustedDayIndex = (date.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const plannedDay = routine.days.find((d: any) => d.dayIndex === adjustedDayIndex);
  const plannedWorkout = workouts.find((w) => w.id === plannedDay?.workoutId);

  const workoutSessions = useWorkoutsHistoryStore((s) => s.workoutSessions);
  const workoutSession = workoutSessions.find((w) => isSameDay(w.date, date));

  return (
    <View style={{ width: SCREEN_WIDTH }} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4 grow">
        {isToday && <RoutineQuickView routine={routine} />}

        {isToday &&
          (!plannedWorkout || plannedDay?.isRestDay ? (
            <RestQuickView routineId={routine.id} date={date} />
          ) : (
            <WorkoutQuickView routine={routine} workout={plannedWorkout} />
          ))}

        {(!isToday || workoutSession?.status === "completed") && <WorkoutSessionView date={date} />}
      </ScrollView>
    </View>
  );
});

// OSITO AMENAZANTE

// <View className="justify-center items-center mt-0 pt-24 pb-8">
//           <View className="ml-20">
//             <Image source={threatning_bear} style={{ width: 128, height: 128 }} />
//             <View className="items-center justify-center" style={{ position: "absolute", top: "-54%", left: "-30%" }}>
//               <ImageBackground
//                 source={thought_bubble}
//                 style={{ width: 128, height: 128, justifyContent: "center", alignItems: "center" }}
//               >
//                 <Text className="font-extrabold text-cyan-600 text-lg leading-tight text-center bottom-2">
//                   ¿fuiste a{"\n"}entrenar hoy?
//                 </Text>
//               </ImageBackground>
//             </View>
//           </View>
//         </View>

//         <View className="flex-row gap-3 w-full">
//           <TouchableOpacity className="border-4 border-green-600 rounded-xl p-4 items-center justify-center flex-row gap-3 flex-1">
//             <Text className="text-green-600 font-black text-3xl ml-4">SI</Text>
//             <Text className="text-3xl">😇</Text>
//           </TouchableOpacity>

//           <TouchableOpacity className="border-4 border-red-600 rounded-xl p-4 items-center justify-center flex-row gap-3 flex-1">
//             <Text className="text-red-600 font-black text-3xl ml-4">NO</Text>
//             <Text className="text-3xl">🔪</Text>
//           </TouchableOpacity>
//         </View>
