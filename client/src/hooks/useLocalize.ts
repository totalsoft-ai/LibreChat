import { useEffect } from 'react';
import { TOptions } from 'i18next';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { resources, loadLanguage, normalizeLanguageCode } from '~/locales/i18n';
import store from '~/store';

export type TranslationKeys = keyof typeof resources.en.translation;

export default function useLocalize() {
  const lang = useRecoilValue(store.lang);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const changeLanguageAsync = async () => {
      // Normalize the language code (e.g., 'fr-FR' -> 'fr') for i18next
      // This ensures we use the simple code that exists in supportedLanguages
      const normalizedLang = normalizeLanguageCode(lang);

      if (i18n.language !== normalizedLang) {
        console.log(`[useLocalize] Language change detected: "${i18n.language}" -> "${lang}" (normalized: "${normalizedLang}")`);
        // Pre-load the language BEFORE changing to it
        // This ensures resources are available when i18next switches
        if (normalizedLang && normalizedLang !== 'en') {
          console.log(`[useLocalize] Pre-loading language "${lang}" before switching...`);
          await loadLanguage(lang);
        }
        console.log(`[useLocalize] Now changing i18next language to "${normalizedLang}"`);
        await i18n.changeLanguage(normalizedLang);
        console.log(`[useLocalize] Language changed successfully to "${normalizedLang}"`);
      }
    };

    changeLanguageAsync().catch((error) => {
      console.error('[useLocalize] Failed to change language:', error);
    });
  }, [lang, i18n]);

  return (phraseKey: TranslationKeys, options?: TOptions) => t(phraseKey, options);
}
