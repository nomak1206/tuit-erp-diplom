import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ruTranslations from './locales/ru.json';
import uzTranslations from './locales/uz.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ruTranslations },
            uz: { translation: uzTranslations }
        },
        fallbackLng: 'ru',
        debug: false,
        interpolation: {
            escapeValue: false, // react already safes from xss
        }
    });

export default i18n;
