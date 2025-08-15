import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ko from '../localization/ko.js';
import en from '../localization/en.js';
import ja from '../localization/ja.js';
import zh from '../localization/zh.js';

const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4', // Updated to v4 for latest compatibility
    resources: {
      ko: {
        translation: ko,
      },
      en: {
        translation: en,
      },
      ja: {
        translation: ja,
      },
      zh: {
        translation: zh,
      },
    },
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language
    debug: __DEV__, // Enable debug in development
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n; 