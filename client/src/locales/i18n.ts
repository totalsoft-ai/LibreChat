import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Only import English as default/fallback - other languages will be lazy loaded
import translationEn from './en/translation.json';

export const defaultNS = 'translation';

// Supported languages list
export const supportedLanguages = [
  'en', 'ar', 'bs', 'ca', 'cs', 'zh-Hans', 'zh-Hant', 'da', 'de', 'es', 'et',
  'fa', 'fr', 'it', 'nb', 'pl', 'pt-BR', 'pt-PT', 'ru', 'ja', 'ka', 'sv',
  'ko', 'lv', 'th', 'tr', 'ug', 'vi', 'nl', 'id', 'he', 'hu', 'hy', 'fi',
  'bo', 'sl', 'uk',
] as const;

// Map of language codes to their dynamic import functions
const languageLoaders: Record<string, () => Promise<{ default: any }>> = {
  ar: () => import('./ar/translation.json'),
  bs: () => import('./bs/translation.json'),
  ca: () => import('./ca/translation.json'),
  cs: () => import('./cs/translation.json'),
  'zh-Hans': () => import('./zh-Hans/translation.json'),
  'zh-Hant': () => import('./zh-Hant/translation.json'),
  da: () => import('./da/translation.json'),
  de: () => import('./de/translation.json'),
  es: () => import('./es/translation.json'),
  et: () => import('./et/translation.json'),
  fa: () => import('./fa/translation.json'),
  fr: () => import('./fr/translation.json'),
  it: () => import('./it/translation.json'),
  nb: () => import('./nb/translation.json'),
  pl: () => import('./pl/translation.json'),
  'pt-BR': () => import('./pt-BR/translation.json'),
  'pt-PT': () => import('./pt-PT/translation.json'),
  ru: () => import('./ru/translation.json'),
  ja: () => import('./ja/translation.json'),
  ka: () => import('./ka/translation.json'),
  sv: () => import('./sv/translation.json'),
  ko: () => import('./ko/translation.json'),
  lv: () => import('./lv/translation.json'),
  th: () => import('./th/translation.json'),
  tr: () => import('./tr/translation.json'),
  ug: () => import('./ug/translation.json'),
  vi: () => import('./vi/translation.json'),
  nl: () => import('./nl/translation.json'),
  id: () => import('./id/translation.json'),
  he: () => import('./he/translation.json'),
  hu: () => import('./hu/translation.json'),
  hy: () => import('./hy/translation.json'),
  fi: () => import('./fi/translation.json'),
  bo: () => import('./bo/translation.json'),
  sl: () => import('./sl/translation.json'),
  uk: () => import('./uk/translation.json'),
};

// Cache for loaded languages
const loadedLanguages = new Set<string>(['en']);

/**
 * Dynamically load a language translation
 * @param language - Language code to load
 * @returns Promise that resolves when language is loaded
 */
export async function loadLanguage(language: string): Promise<void> {
  // Already loaded or English (pre-loaded)
  if (loadedLanguages.has(language) || language === 'en') {
    return;
  }

  const loader = languageLoaders[language];
  if (!loader) {
    console.warn(`Language "${language}" is not supported`);
    return;
  }

  try {
    const translation = await loader();
    i18n.addResourceBundle(language, defaultNS, translation.default, true, true);
    loadedLanguages.add(language);
  } catch (error) {
    console.error(`Failed to load language "${language}":`, error);
  }
}

// Initial resources with only English
export const resources = {
  en: { translation: translationEn },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      'zh-TW': ['zh-Hant', 'en'],
      'zh-HK': ['zh-Hant', 'en'],
      zh: ['zh-Hans', 'en'],
      default: ['en'],
    },
    fallbackNS: 'translation',
    ns: ['translation'],
    debug: false,
    defaultNS,
    resources,
    interpolation: { escapeValue: false },
  });

// Load the detected language after initialization
i18n.on('initialized', () => {
  const currentLanguage = i18n.language;
  if (currentLanguage && currentLanguage !== 'en') {
    loadLanguage(currentLanguage).catch((error) => {
      console.error('Failed to load initial language:', error);
    });
  }
});

// Listen for language changes and load them dynamically
i18n.on('languageChanged', (language) => {
  if (language && language !== 'en' && !loadedLanguages.has(language)) {
    loadLanguage(language).catch((error) => {
      console.error('Failed to load language on change:', error);
    });
  }
});

export default i18n;
