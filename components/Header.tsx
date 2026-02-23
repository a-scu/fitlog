import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const Header = ({ title, children, rightElement, showBack = true, onBack }: HeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={{ paddingTop: insets.top }} className="bg-white border-b border-neutral-100">
      <View className="p-3 h-14 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity onPress={handleBack} className="pr-4 pl-2 items-center justify-center">
              <Ionicons name="arrow-back" className="!text-xl !text-neutral-800" />
            </TouchableOpacity>
          )}
          <Text numberOfLines={1} className="text-xl font-medium text-neutral-800 flex-1">
            {title || children}
          </Text>
        </View>

        {rightElement && <View className="pl-2">{rightElement}</View>}
      </View>
    </View>
  );
};

export default Header;
