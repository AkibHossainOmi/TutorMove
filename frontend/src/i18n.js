import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import zh from './locales/zh/translation.json';
import hi from './locales/hi/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';
import ar from './locales/ar/translation.json';
import bn from './locales/bn/translation.json';
import pt from './locales/pt/translation.json';
import ru from './locales/ru/translation.json';
import ur from './locales/ur/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      hi: { translation: hi },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
      bn: { translation: bn },
      pt: { translation: pt },
      ru: { translation: ru },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    supportedLngs: ['en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur'],
    detection: {
      order: ['localStorage', 'navigator', 'querystring', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
