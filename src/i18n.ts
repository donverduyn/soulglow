import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { HMRPlugin } from 'i18next-hmr/plugin';
import Backend from 'i18next-http-backend';
import { memoize } from 'common/utils/memoize';

export const initializeI18N = memoize(
  (callback?: (i18n: typeof i18next) => void) => {
    const i18nInstance = i18next.createInstance();
    void i18nInstance.use(Backend).use(LanguageDetector);

    if (import.meta.env.DEV) {
      i18nInstance.use(
        new HMRPlugin({
          vite: { client: typeof window !== 'undefined' },
        })
      );
    }

    void i18nInstance.init(
      {
        backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
        // debug: true,
        fallbackLng: 'en',
        // lng: 'cimode',
        // lng: 'nl',
        interpolation: { escapeValue: true },
        // preload: ['en', 'nl'],
        react: { useSuspense: true },
        supportedLngs: ['en', 'nl'],
      },
      () => callback && callback(i18nInstance)
    );

    return i18nInstance;
  }
);
