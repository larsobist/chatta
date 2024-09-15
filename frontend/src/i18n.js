import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi)  // Use HttpApi to load translations from a backend
    .use(initReactI18next)  // Initialize i18next for React
    .init({
        supportedLngs: ['en', 'de'],  // Supported languages: English and German
        fallbackLng: 'en',  // Default language if the selected one isn't available
        lng: 'de',  // Initial language set to German
        backend: {
            loadPath: '/chatta/locales/{{lng}}.json',  // Path to translation files
        },
        interpolation: {
            escapeValue: false,  // Prevents XSS since React already escapes by default
        },
    });

export default i18n;
