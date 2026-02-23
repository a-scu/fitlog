import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUS from "@/translations/en-US.json";
import esAR from "@/translations/es-AR.json";

const resources = {
  "en-US": { translation: enUS },
  "es-AR": { translation: esAR },
} as const;

const fallbackLng = "en-US";

const getBestAvailableLanguage = () => {
  const locales = Localization.getLocales();

  if (!locales || locales.length === 0) {
    return fallbackLng;
  }

  for (const locale of locales) {
    const { languageTag, languageCode } = locale;

    if (languageTag && resources[languageTag as keyof typeof resources]) {
      return languageTag;
    }

    if (languageCode === "es") {
      return "es-AR";
    }

    if (languageCode === "en") {
      return "en-US";
    }
  }

  return fallbackLng;
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    resources,
    lng: getBestAvailableLanguage(),
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
  });
}

export type AppLanguage = keyof typeof resources;

export const AVAILABLE_LANGUAGES: Record<AppLanguage, { label: string }> = {
  "en-US": { label: "English (US)" },
  "es-AR": { label: "Español (AR)" },
};

export const changeLanguage = (language: AppLanguage) => {
  return i18n.changeLanguage(language);
};

export default i18n;

