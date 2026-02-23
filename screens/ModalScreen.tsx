import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";

export default function ModalScreen() {
  return (
    <View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

