import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
  hideBack?: boolean;
  onBack?: () => void;
  options?: any;
  headerRight?: any;
}

const Header = ({
  title,
  children,
  hideBack,
  onBack,
  options,
  headerRight,
}: HeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const resolvedHeaderRight = headerRight || options?.headerRight;
  const renderHeaderRight = () => {
    if (!resolvedHeaderRight) return null;
    if (typeof resolvedHeaderRight === "function") {
      return resolvedHeaderRight();
    }
    return resolvedHeaderRight;
  };

  const resolvedTitle =
    title || options?.headerTitle || options?.title || children;

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900"
    >
      <View className="p-3 pr-0 h-14 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {!hideBack && (
            <TouchableOpacity
              onPress={handleBack}
              className="pr-4 pl-2 items-center justify-center"
            >
              <Ionicons
                name="arrow-back"
                className="!text-xl !text-neutral-800 dark:!text-white"
              />
            </TouchableOpacity>
          )}
          <Text
            numberOfLines={1}
            className="text-xl font-medium text-neutral-800 dark:text-white flex-1"
            style={{ marginLeft: hideBack ? 8 : 0 }}
          >
            {resolvedTitle}
          </Text>
        </View>

        {resolvedHeaderRight && <View>{renderHeaderRight()}</View>}
      </View>
    </View>
  );
};

export default Header;
