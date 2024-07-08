import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
        lng: 'de',
        backend: {
            loadPath: '/chatta/locales/{{lng}}.json', // Adjust for subpath
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
