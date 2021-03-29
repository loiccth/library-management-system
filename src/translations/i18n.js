import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { TRANSLATIONS_EN } from './en/translations'
import { TRANSLATIONS_FR } from './fr/translations'
import { TRANSLATIONS_ZH } from './zh/translations'
import { TRANSLATIONS_AR } from './ar/translations'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources: {
            en: {
                translation: TRANSLATIONS_EN
            },
            fr: {
                translation: TRANSLATIONS_FR
            },
            zh: {
                translation: TRANSLATIONS_ZH
            },
            ar: {
                translation: TRANSLATIONS_AR
            }
        }
    })

export default i18n