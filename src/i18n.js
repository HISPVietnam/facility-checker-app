import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLocale from "./locales/en";
import viLocale from "./locales/vi";
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enLocale
      },
      vi: {
        translation: viLocale
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });
