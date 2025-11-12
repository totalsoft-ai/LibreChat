import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Only import English as default/fallback - other languages will be lazy loaded
import translationEn from './en/translation.json';

export const defaultNS = 'translation';

// Supported languages list
export const supportedLanguages = [
  'en',
  'ar',
  'bs',
  'ca',
  'cs',
  'zh-Hans',
  'zh-Hant',
  'da',
  'de',
  'es',
  'et',
  'fa',
  'fr',
  'it',
  'nb',
  'pl',
  'pt-BR',
  'pt-PT',
  'ru',
  'ja',
  'ka',
  'sv',
  'ko',
  'lv',
  'th',
  'tr',
  'ug',
  'vi',
  'nl',
  'id',
  'he',
  'hu',
  'hy',
  'fi',
  'bo',
  'sl',
  'uk',
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

// Map full locale codes (sent by UI) to simple language codes (used by loaders)
// This mapping ensures compatibility between the LangSelector component and the lazy loader
const languageCodeMap: Record<string, string> = {
  'en-US': 'en',
  'ar-EG': 'ar',
  'da-DK': 'da',
  'de-DE': 'de',
  'es-ES': 'es',
  'ca-ES': 'ca',
  'et-EE': 'et',
  'fa-IR': 'fa',
  'fr-FR': 'fr',
  'he-HE': 'he',
  'hu-HU': 'hu',
  'hy-AM': 'hy',
  'it-IT': 'it',
  'pl-PL': 'pl',
  'ru-RU': 'ru',
  'ja-JP': 'ja',
  'ka-GE': 'ka',
  'cs-CZ': 'cs',
  'sv-SE': 'sv',
  'ko-KR': 'ko',
  'lv-LV': 'lv',
  'vi-VN': 'vi',
  'th-TH': 'th',
  'tr-TR': 'tr',
  'nl-NL': 'nl',
  'id-ID': 'id',
  'fi-FI': 'fi',
  'uk-UA': 'uk',
  // Languages that already match (kept for explicit documentation):
  bs: 'bs',
  nb: 'nb',
  ug: 'ug',
  sl: 'sl',
  bo: 'bo',
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
};

/**
 * Normalize language code from full locale (e.g., 'fr-FR') to simple code (e.g., 'fr')
 * @param language - Full locale code or simple language code
 * @returns Normalized language code that matches supportedLanguages array
 */
export function normalizeLanguageCode(language: string): string {
  return languageCodeMap[language] || language;
}

// Cache for loaded languages
const loadedLanguages = new Set<string>(['en']);

/**
 * Dynamically load a language translation
 * @param language - Language code to load (can be full locale like 'es-ES' or simple like 'es')
 * @returns Promise that resolves when language is loaded
 */
export async function loadLanguage(language: string): Promise<void> {
  // Normalize the language code using the mapping
  // e.g., 'es-ES' -> 'es', 'pt-BR' -> 'pt-BR' (some codes don't need mapping)
  const normalizedLang = normalizeLanguageCode(language);

  console.log(`[i18n] loadLanguage called with: "${language}", normalized to: "${normalizedLang}"`);

  // Already loaded or English (pre-loaded)
  if (loadedLanguages.has(normalizedLang) || normalizedLang === 'en') {
    console.log(`[i18n] Language "${normalizedLang}" already loaded`);
    // If language was loaded under normalized code but not under original code,
    // copy the resource bundle to make it accessible under the original code too
    if (language !== normalizedLang && !loadedLanguages.has(language)) {
      const existingBundle = i18n.getResourceBundle(normalizedLang, defaultNS);
      if (existingBundle) {
        console.log(`[i18n] Copying resource bundle from "${normalizedLang}" to "${language}"`);
        i18n.addResourceBundle(language, defaultNS, existingBundle, true, true);
      }
      loadedLanguages.add(language);
    }
    return;
  }

  const loader = languageLoaders[normalizedLang];
  if (!loader) {
    console.warn(`Language "${language}" (normalized: "${normalizedLang}") is not supported`);
    return;
  }

  try {
    console.log(`[i18n] Loading translation for "${language}"...`);
    const translation = await loader();
    // Add resource bundle under the original language code that was requested
    // This ensures i18next can find it when changeLanguage is called with that code
    i18n.addResourceBundle(language, defaultNS, translation.default, true, true);
    console.log(`[i18n] Added resource bundle for "${language}"`);

    // If the language code is different from normalized, also add under normalized code
    // This supports both 'es-ES' and 'es' lookups
    if (language !== normalizedLang) {
      i18n.addResourceBundle(normalizedLang, defaultNS, translation.default, true, true);
      console.log(`[i18n] Also added resource bundle for normalized code "${normalizedLang}"`);
    }

    // Cache both the normalized and original language codes
    loadedLanguages.add(normalizedLang);
    loadedLanguages.add(language);
    console.log(`[i18n] Successfully loaded language "${language}". Available languages:`, i18n.languages);
  } catch (error) {
    console.error(
      `Failed to load language "${language}" (normalized: "${normalizedLang}"):`,
      error,
    );
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
    // Allow i18next to accept dynamically loaded languages
    nonExplicitSupportedLngs: true,
    // Disable loading from server (we handle loading ourselves)
    load: 'currentOnly',
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
  console.log(`[i18n] languageChanged event fired with language: "${language}"`);
  console.log(`[i18n] Current i18n.language:`, i18n.language);
  console.log(`[i18n] Available languages:`, i18n.languages);
  console.log(`[i18n] Loaded languages cache:`, Array.from(loadedLanguages));

  if (language && language !== 'en') {
    const normalizedLang = normalizeLanguageCode(language);
    // Only load if not already loaded (check both original and normalized codes)
    if (!loadedLanguages.has(language) && !loadedLanguages.has(normalizedLang)) {
      console.log(`[i18n] Loading language "${language}" after language change...`);
      loadLanguage(language).catch((error) => {
        console.error('Failed to load language on change:', error);
      });
    } else {
      console.log(`[i18n] Language "${language}" already in cache, skipping load`);
    }
  }
});

export default i18n;
