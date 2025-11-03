import { useEffect } from 'react';
import { TOptions } from 'i18next';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { resources, loadLanguage } from '~/locales/i18n';
import store from '~/store';

export type TranslationKeys = keyof typeof resources.en.translation;

export default function useLocalize() {
  const lang = useRecoilValue(store.lang);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const changeLanguageAsync = async () => {
      if (i18n.language !== lang) {
        console.log(`[useLocalize] Language change detected: "${i18n.language}" -> "${lang}"`);
        // Pre-load the language BEFORE changing to it
        // This ensures resources are available when i18next switches
        if (lang && lang !== 'en') {
          console.log(`[useLocalize] Pre-loading language "${lang}" before switching...`);
          await loadLanguage(lang);
        }
        console.log(`[useLocalize] Now changing i18next language to "${lang}"`);
        await i18n.changeLanguage(lang);
        console.log(`[useLocalize] Language changed successfully to "${lang}"`);
      }
    };

    changeLanguageAsync().catch((error) => {
      console.error('[useLocalize] Failed to change language:', error);
    });
  }, [lang, i18n]);

  return (phraseKey: TranslationKeys, options?: TOptions) => t(phraseKey, options);
}
