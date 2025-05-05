import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./locales";

const initObject = {
  resources: {},
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
};

Object.keys(resources).forEach((language) => {
  initObject.resources[language] = {
    translation: resources[language]
  };
});

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init(initObject);
