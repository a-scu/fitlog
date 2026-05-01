import { useWorkoutsHistoryStore } from "@/stores/WorkoutsHistoryStore";
import { View, TextInput } from "react-native";
import { format, isSameDay } from "date-fns";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "tailwindcss/colors";
import { es } from "date-fns/locale";

export default function AddNoteScreen({ route }: any) {
  const { date } = route.params;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const updateWorkoutSession = useWorkoutsHistoryStore((s) => s.updateWorkoutSession);
  const workoutSession = useWorkoutsHistoryStore((s) => s.workoutSessions.find((sess) => isSameDay(date, sess.date)));

  const dateFormatted = format(new Date(date), "EEE d 'de' MMM", { locale: es });

  useEffect(() => {
    navigation.setOptions({
      title: `Agregar Nota  (${dateFormatted})`,
    });
  }, []);

  const updateNotes = (value: string) => {
    updateWorkoutSession(date, { notes: value });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      <TextInput
        placeholder="Notas del entreno..."
        placeholderTextColor={colors.neutral[400]}
        className="w-full flex-1 p-8 text-xl tracking-wider"
        multiline
        style={{ textAlignVertical: "top" }}
        defaultValue={workoutSession?.notes || ""}
        onChangeText={(value) => updateNotes(value)}
      />
    </View>
  );
}
