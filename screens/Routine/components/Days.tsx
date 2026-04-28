import { View, Text, TouchableOpacity, useWindowDimensions, Pressable } from "react-native";
import { useRef, useState, useCallback, memo, useMemo, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

import { RoutineDay } from "@/types/Routine";
import { Workout } from "@/types/Workout";

import { useRoutinesStore } from "@/stores/RoutinesStore";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";

import EXERCISES from "@/assets/data/exercises.json";

import { randomId } from "@/utils/random";
import { Image } from "expo-image";
import { SET_TYPES } from "@/constants/SetTypes";
import { capitalize } from "@/lib/utils";
import ExerciseGif from "@/components/ExerciseGif";
import { useGlobalSettingsStore } from "@/stores/GlobalSettingsStore";
import { dayNames } from "@/constants/DayNames";
import { SelectWorkoutModal } from "@/components/modals/SelectWorkoutModal";
import { useModalStore } from "@/stores/useModalStore";

export default function Days({ routineId, days }: { routineId: string; days: RoutineDay[] }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const workouts = useWorkoutsStore((s) => s.workouts);

  // Calculate current day index (0: Monday, ..., 6: Sunday)
  const initialIndex = (new Date().getDay() + 6) % 7;

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const flatListRef = useRef<Animated.FlatList<RoutineDay>>(null);

  // scrollX tracks offset on the UI thread — drives button animations in real time
  // Initialized to the current day offset
  const scrollX = useSharedValue(initialIndex * screenWidth);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  useEffect(() => {
    if (initialIndex > 0) {
      // Set initial scroll without animation
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 0);
    }
  }, []);

  const handleDayPress = useCallback((index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onMomentumScrollEnd = useCallback(
    (event: any) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      if (index !== activeIndex) setActiveIndex(index);
    },
    [activeIndex],
  );

  const renderItem = useCallback(
    ({ item: day }: { item: RoutineDay }) => {
      const workout = workouts.find((w) => w.id === day.workoutId);
      return <DaySlide day={day} routineId={routineId} screenWidth={screenWidth} workout={workout} />;
    },
    [workouts, routineId, screenWidth],
  );

  return (
    <View className="flex-1 gap-4">
      <Text className="text-neutral-500 font-medium ml-3">Días de entrenamiento</Text>

      {/* Days indicator */}
      <View className="flex-row items-center justify-center gap-2 px-3">
        {days.map((day, index) => (
          <DayButton
            key={day.dayIndex}
            index={index}
            scrollX={scrollX}
            screenWidth={screenWidth}
            hasWorkout={!day.isRestDay}
            onPress={handleDayPress}
          />
        ))}
      </View>

      <Animated.FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        data={days}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, minHeight: screenHeight / 2 }}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        renderItem={renderItem}
        keyExtractor={(day) => day.dayIndex.toString()}
      />
    </View>
  );
}

const DaySlide = memo(
  ({
    day,
    routineId,
    screenWidth,
    workout,
  }: {
    day: RoutineDay;
    routineId: string;
    screenWidth: number;
    workout?: Workout;
  }) => {
    return (
      <View style={{ width: screenWidth }} className="px-3">
        <View className="flex-1 rounded-3xl p-5 border border-neutral-200">
          <DayHeader routineId={routineId} day={day} workout={workout} />

          {day.isRestDay ? (
            <RestDayView />
          ) : (
            <View className="flex-1">
              {workout ? (
                <WorkoutView routineId={routineId} dayIndex={day.dayIndex} workout={workout} />
              ) : (
                <EmptyWorkoutView routineId={routineId} day={day} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  },
);

const DayButton = memo(
  ({
    index,
    scrollX,
    screenWidth,
    hasWorkout,
    onPress,
  }: {
    index: number;
    scrollX: Animated.SharedValue<number>;
    screenWidth: number;
    hasWorkout: boolean;
    onPress: (index: number) => void;
  }) => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth];

    const animatedStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(scrollX.value, inputRange, ["transparent", "black", "transparent"]);

      const borderColor = hasWorkout
        ? colors.green[500]
        : interpolateColor(scrollX.value, inputRange, [colors.neutral[200], colors.black, colors.neutral[200]]);

      return {
        backgroundColor,
        borderColor,
      };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      const color = hasWorkout
        ? colors.green[500]
        : interpolateColor(scrollX.value, inputRange, [colors.neutral[400], colors.white, colors.neutral[400]]);

      return {
        color,
      };
    });

    return (
      <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.8}>
        <Animated.View
          style={[
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
            },
            animatedStyle,
          ]}
        >
          <Animated.Text style={[animatedTextStyle]} className="font-black">
            {dayNames[index].slice(0, 1).toUpperCase()}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const DayHeader = memo(({ routineId, day, workout }: { routineId: string; day: RoutineDay; workout?: Workout }) => {
  const updateRoutineDay = useRoutinesStore((s) => s.updateRoutineDay);

  const isRest = day.isRestDay;
  const progress = useSharedValue(isRest ? 1 : 0);
  const BUTTON_WIDTH = 48;
  const BUTTON_HEIGHT = 32;
  const PADDING = 6;

  useEffect(() => {
    progress.value = withTiming(isRest ? 1 : 0, { duration: 200 });
  }, [isRest]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * BUTTON_WIDTH }],
  }));

  const workoutIconStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.red[400], colors.neutral[400]]),
  }));

  const restIconStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.neutral[400], colors.indigo[500]]),
  }));

  return (
    <View className="flex-row items-start justify-between mb-5">
      <View>
        <Text className="text-neutral-400 font-medium text-sm uppercase tracking-wider">{dayNames[day.dayIndex]}</Text>
        <Text className="font-bold text-2xl">{day.isRestDay ? "Descanso" : workout?.name || "Entrenamiento"}</Text>
      </View>

      {/* Toggle */}
      <View
        style={{
          padding: PADDING,
          borderWidth: 1,
          borderColor: colors.neutral[100],
          borderRadius: 99,
          flexDirection: "row",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Animated.View
          style={[
            pillStyle,
            {
              width: BUTTON_WIDTH,
              height: BUTTON_HEIGHT,
              position: "absolute",
              left: PADDING,
              top: PADDING,
              borderRadius: 99,
              backgroundColor: colors.white,
              // borderWidth: 1,
              // borderColor: colors.neutral[100],
              shadowColor: colors.neutral[600],
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 1,
              elevation: 2,
            },
          ]}
        />

        <TouchableOpacity
          onPress={() => updateRoutineDay(routineId, day.dayIndex, "isRestDay", false)}
          style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
          className="items-center justify-center z-10"
        >
          <AnimatedIonicons name="fitness" size={18} style={workoutIconStyle} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => updateRoutineDay(routineId, day.dayIndex, "isRestDay", true)}
          style={{ width: BUTTON_WIDTH, height: BUTTON_HEIGHT }}
          className="items-center justify-center z-10"
        >
          <AnimatedIonicons name={"cloudy-night"} size={18} style={restIconStyle} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const RestDayView = memo(() => (
  <View className="flex-1 items-center justify-center gap-3">
    <Image
      source={
        "https://png.pngtree.com/png-clipart/20231222/original/pngtree-blissful-rest-cartoon-bear-relishing-lazy-hammock-afternoon-png-image_13912197.png"
      }
      style={{ width: 228, height: 228 }}
    />
  </View>
));

const EmptyWorkoutView = memo(({ routineId, day }: { routineId: string; day: RoutineDay }) => {
  const navigation = useNavigation();

  const updateRoutineDay = useRoutinesStore((s) => s.updateRoutineDay);
  const addWorkout = useWorkoutsStore((s) => s.addWorkout);

  const handleCreateWorkout = useCallback(() => {
    navigation.navigate("createWorkout", { routineId, dayIndex: day.dayIndex });
  }, [navigation, routineId, day.dayIndex]);

  const showModal = useModalStore((s) => s.showModal);

  const handleImportWorkout = useCallback(() => {
    showModal({
      snapPoints: ["60%", "90%"],
      content: (
        <SelectWorkoutModal
          hideTemplate={true}
          onSelectWorkout={(selectedWorkout, asTemplate) => {
            if (asTemplate) {
              const newWorkoutId = randomId();
              const newSteps = selectedWorkout.steps.map((step) => ({
                ...step,
                id: randomId(),
              }));
              addWorkout({
                ...selectedWorkout,
                id: newWorkoutId,
                name: `${selectedWorkout.name} (Copia)`,
                steps: newSteps,
              });
              updateRoutineDay(routineId, day.dayIndex, "workoutId", newWorkoutId);
            } else {
              updateRoutineDay(routineId, day.dayIndex, "workoutId", selectedWorkout.id);
            }
            updateRoutineDay(routineId, day.dayIndex, "isRestDay", false);
          }}
        />
      ),
    });
  }, [routineId, day.dayIndex, addWorkout, updateRoutineDay, showModal]);

  return (
    <View className="w-full justify-center items-center flex-1 gap-3">
      <TouchableOpacity
        onPress={handleCreateWorkout}
        className="p-3 rounded-2xl w-full border-1.5 border-neutral-200 border-dashed flex-1 h-full items-center justify-center gap-2.5"
      >
        <Ionicons name="add-outline" size={29} color={colors.neutral[400]} />
        <Text className="text-neutral-400 font-semibold text-lg">Crear entrenamiento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border-1.5 border-neutral-200 w-full border-dashed p-8 rounded-2xl items-center justify-center gap-3"
        onPress={handleImportWorkout}
      >
        <Ionicons name="download-outline" size={28} color={colors.neutral[400]} />
        <Text className="text-neutral-400 font-semibold text-lg">Usar existente</Text>
      </TouchableOpacity>
    </View>
  );
});

const WorkoutView = memo(
  ({ routineId, dayIndex, workout }: { routineId: string; dayIndex: number; workout: Workout }) => {
    const navigation = useNavigation();

    const updateRoutineDay = useRoutinesStore((s) => s.updateRoutineDay);

    const onNavigate = useCallback(
      () => navigation.navigate("editWorkout", { workoutId: workout.id }),
      [navigation, workout.id],
    );

    const handleRemoveWorkout = () => {
      updateRoutineDay(routineId, dayIndex, "workoutId", null);
    };

    return (
      <View className="flex-1 gap-3">
        {workout.steps.length > 0 ? (
          <Pressable onPress={onNavigate} className="flex-1">
            <View className="gap-3 px-1">
              {workout.steps.slice(0, 6).map((step) => (
                <Step key={step.id} step={step} />
              ))}
              {workout.steps.length > 6 && (
                <Text className="text-neutral-400 text-xs mt-1 ml-5">+ {workout.steps.length - 6} más...</Text>
              )}
            </View>
          </Pressable>
        ) : (
          <TouchableOpacity onPress={onNavigate} className="flex-1">
            <View className="flex-1 items-center gap-2 justify-center border-1.5 border-dashed border-neutral-200 rounded-3xl p-8">
              <View className="justify-center items-center gap-3">
                <Ionicons name="create-outline" size={28} color={colors.neutral[400]} />
                <Text className="text-neutral-400 font-semibold text-lg">Editar rutina</Text>
              </View>

              <Text className="text-neutral-400 text-sm text-center">Tu rutina todavia no tiene ejercicios</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleRemoveWorkout}
          className="border border-neutral-200 rounded-xl p-3 justify-center items-center gap-1 flex-row"
        >
          <Ionicons name="close-circle-outline" className="!text-base !leading-none" color={colors.neutral[400]} />
          <Text className="text-neutral-400 font-medium text-center">Quitar entreno</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const Rest = memo(({ step }: { step: any }) => {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl px-3 py-2">
      <Ionicons name="time-outline" size={14} color={colors.neutral[600]} />
      <Text className="text-neutral-600 font-medium" numberOfLines={1}>
        Descanso {step?.duration}s
      </Text>
    </View>
  );
});

const Step = memo(({ step }: { step: any }) => {
  if (step.type === "rest") return <Rest step={step} />;

  const exercise = useMemo(() => EXERCISES.find((e) => e.exerciseId === step.exerciseId), [step.exerciseId]);

  if (!exercise) return <Text>No se encontro el ejercicio</Text>;

  const weightUnit = useGlobalSettingsStore((s) => s.weightUnit);

  const setType = SET_TYPES.find((s) => s.id === step.type) || SET_TYPES[0];

  const { weight, reps, rir } = step;

  const validWeight = (weight.isRange && weight.min && weight.max) || weight.value;
  const validReps = (reps.isRange && reps.min && reps.max) || reps.value;
  const validRir = (rir.isRange && rir.min && rir.max) || rir.value;

  return (
    <View className="rounded-xl p-4 border border-neutral-100">
      <Text
        className="font-medium text-sm"
        style={{
          color: setType.color[500],
        }}
      >
        {setType.label}
      </Text>

      <Text className="text-neutral-800 font-medium" numberOfLines={1}>
        {capitalize(exercise.name) || "Ejercicio"}
      </Text>

      <View className="flex-row gap-3">
        {validWeight && (
          <Text>
            {weight.isRange ? `${weight.min} - ${weight.max}` : weight.value} {weightUnit}
          </Text>
        )}
        {validReps && <Text>x{reps.isRange ? `${reps.min} - ${reps.max}` : reps.value} reps</Text>}
        {validRir && <Text>rir {rir.isRange ? `${rir.min} - ${rir.max}` : rir.value}</Text>}
      </View>
    </View>
  );
});
