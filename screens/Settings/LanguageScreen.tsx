import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n, {
  AVAILABLE_LANGUAGES,
  changeLanguage,
  AppLanguage,
} from "@/lib/i18n";
import { useEffect } from "react";

export default function LanguageScreen({ navigation }: any) {
  const { t } = useTranslation();
  const currentLanguage = i18n.language;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    navigation.setOptions({
      title: t("screens.settings.language", "Idioma"),
    });
  }, [navigation, t]);

  const handleSelectLanguage = (langKey: AppLanguage) => {
    changeLanguage(langKey);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900 p-4">
      <Text className="text-sm font-bold text-neutral-400 uppercase mb-3 ml-1">
        {t("screens.settings.selectLanguage", "Seleccionar Idioma")}
      </Text>

      <View className="gap-3">
        {(Object.keys(AVAILABLE_LANGUAGES) as AppLanguage[]).map((langKey) => {
          const isSelected = currentLanguage === langKey;
          const langInfo = AVAILABLE_LANGUAGES[langKey];

          return (
            <TouchableOpacity
              key={langKey}
              onPress={() => handleSelectLanguage(langKey)}
              activeOpacity={0.8}
              className="flex-row items-center justify-between p-5 rounded-3xl"
              style={{
                backgroundColor: isSelected
                  ? isDark
                    ? "rgba(99, 102, 241, 0.15)"
                    : "#f0f2ff"
                  : isDark
                    ? "#262626"
                    : "#ffffff",
                borderColor: isSelected
                  ? "#6366f1"
                  : isDark
                    ? "#3f3f46"
                    : "#f4f4f5",
                borderWidth: 1,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`w-10 h-10 rounded-2xl items-center justify-center ${
                    isSelected
                      ? "bg-indigo-100 dark:bg-indigo-900/40"
                      : "bg-neutral-100 dark:bg-neutral-700"
                  }`}
                >
                  <Ionicons
                    name="language"
                    size={20}
                    color={isSelected ? "#6366f1" : "#9ca3af"}
                  />
                </View>
                <Text
                  className={`font-semibold text-base ${
                    isSelected
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {langInfo.label}
                </Text>
              </View>

              {isSelected ? (
                <View className="w-6 h-6 rounded-full bg-indigo-500 items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-700" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
