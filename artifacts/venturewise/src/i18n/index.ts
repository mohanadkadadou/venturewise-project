import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import tr from "./locales/tr.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      tr: { translation: tr },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar", "tr"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "vw-language",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const RTL_LANGUAGES = ["ar"];

export function isRTL(lang: string) {
  return RTL_LANGUAGES.includes(lang);
}
