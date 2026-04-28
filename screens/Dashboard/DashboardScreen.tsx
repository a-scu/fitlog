import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkspacesStore } from "@/stores/WorkspacesStore";
import { useRoutinesStore } from "@/stores/RoutinesStore";

import { Ionicons } from "@expo/vector-icons";
import { dayNames } from "@/constants/DayNames";
import { useWorkoutsStore } from "@/stores/WorkoutsStore";
import { getRoutineMuscles } from "@/utils/routineMuscles";
import { Set, Step, Workout } from "@/types/Workout";
import colors from "tailwindcss/colors";
import { useNavigation } from "@react-navigation/native";
import { RoutineDay } from "@/types/Routine";
import RoutineQuickView from "@/components/RoutineQuickView";
import WorkoutQuickView from "@/components/WorkoutQuickView";
import { adjustedDay, monthDay } from "@/constants/Time";
import { Image } from "expo-image";

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const getPersonalWorkspace = useWorkspacesStore((state) => state.getPersonalWorkspace);
  const personalWorkspace = getPersonalWorkspace();

  const routines = useRoutinesStore((state) => state.routines);
  const workouts = useWorkoutsStore((s) => s.workouts);

  if (!personalWorkspace) return;

  const { routineId } = personalWorkspace;
  const routine = routines.find((r) => r.id === routineId);

  console.log("Personal routine:", routine);

  if (!routineId || !routine) {
    const handleCreateRoutine = () => {
      navigation.navigate("createRoutine", { workspaceId: personalWorkspace.id });
    };

    return (
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerClassName="p-3">
          <TouchableOpacity onPress={handleCreateRoutine} className="p-6 border rounded-md">
            <Text>Crear rutina</Text>
          </TouchableOpacity>

          <Text>Aun no creaste ninguna rutina</Text>
        </ScrollView>
      </View>
    );
  }

  const today = routine.days.find((d) => d.dayIndex === adjustedDay);
  const todaysWorkout = workouts.find((w) => w.id === today?.workoutId);

  if (!today) return <Text>No se encontro un entreno para hoy</Text>;

  console.log("Today's Workout", today);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="p-3 gap-3">
        {/* Routine View */}

        <RoutineQuickView routine={routine} />

        {!todaysWorkout || today?.isRestDay ? (
          <RestQuickView routineId={routineId} />
        ) : (
          <WorkoutQuickView workout={todaysWorkout} />
        )}
      </ScrollView>
    </View>
  );
}

const RestQuickView = ({ routineId }: { routineId: string }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("routine", { routineId })}
      className="border border-neutral-200 p-5 rounded-xl"
    >
      {/*  */}
      <View className="flex-row items-start justify-between flex-1">
        <Text className="text-neutral-500 text-sm">Hoy</Text>

        <View className="justify-end items-center flex-row gap-1">
          <Text className="text-neutral-400 text-end text-sm">Ver detalle</Text>
          <Ionicons name="enter-outline" className="!text-sm !leading-none" color={colors.neutral[400]} />
        </View>
      </View>

      <Text className="font-bold text-xl">
        Descanso
        <Text className="text-neutral-500 text-base font-medium">
          {" - "}
          {dayNames[adjustedDay]} {monthDay}
        </Text>
      </Text>

      <View className="size-48 self-center">
        <Image
          source={
            "https://png.pngtree.com/png-clipart/20231222/original/pngtree-blissful-rest-cartoon-bear-relishing-lazy-hammock-afternoon-png-image_13912197.png"
          }
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

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
