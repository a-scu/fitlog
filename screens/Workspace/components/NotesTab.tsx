import { View, Text, ScrollView } from "react-native";
import { Workspace } from "@/types/Workspace";

interface Props {
  workspace: Workspace;
}

export default function NotesTab({ workspace }: Props) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      contentContainerClassName="p-4 gap-4"
    >
      <Text className="text-neutral-400 text-center mt-10">Aun no hay notas</Text>
    </ScrollView>
  );
}
