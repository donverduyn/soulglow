import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { HMRPlugin } from 'i18next-hmr/plugin';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import EN from 'assets/locales/en/translation.json';
import NL from 'assets/locales/nl/translation.json';
import { memoize } from 'common/utils/memoize';

export const initializeI18N = memoize(
  (callback?: (i18n: typeof i18next) => void): typeof i18next => {
    const i18nInstance = i18next.createInstance();

    const resourceMap = {
      en: { translation: EN },
      nl: { translation: NL },
    };

    void (async () => {
      i18nInstance
        .use(resourcesToBackend(resourceMap))
        .use(new HMRPlugin({ vite: { client: true } }))
        .use(LanguageDetector)
        .use(initReactI18next);

      await i18nInstance.init(
        {
          fallbackLng: 'en',
          interpolation: { escapeValue: true },
          react: { useSuspense: true },
          supportedLngs: ['en', 'nl'],
        },
        () => callback?.(i18nInstance)
      );
    })();

    return i18nInstance;
  }
);
