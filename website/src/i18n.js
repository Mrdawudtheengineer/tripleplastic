import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/en.json";
import translationAM from "./locales/am.json";

const resources = {
  en: { translation: translationEN },
  am: { translation: translationAM },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
