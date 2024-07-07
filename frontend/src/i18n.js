import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi) // load translations using http
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
        lng: 'de',
        backend: {
            loadPath: '/locales/{{lng}}.json'
        },
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
