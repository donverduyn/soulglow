import type { Booleans, Fn, Pipe, Tuples } from 'hotscript';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend, { HttpBackendOptions } from 'i18next-http-backend';
import type { IsNever } from 'type-fest';
import { memoize } from 'common/utils/memoize';
import type { default as DataTypeEN } from './../public/locales/en/translation.json';
import type { default as DataTypeNL } from './../public/locales/nl/translation.json';

type Locales = [typeof DataTypeEN, typeof DataTypeNL];

type Extends<T, U> = U extends T ? T : never;

interface ContainsFn<T> extends Fn {
  return: IsNever<Extends<T, keyof this['arg0']>>;
}

export type TranslationAvailable<T> = Pipe<
  Locales,
  [
    Tuples.Map<ContainsFn<T>>,
    Tuples.Some<Booleans.Extends<false>>,
    Booleans.Not,
  ]
>;

export const initializeI18N = memoize(() => {
  void i18n
    .use(Backend)
    .use(LanguageDetector)
    .init<HttpBackendOptions>({
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      fallbackLng: 'en',
      // lng: 'nl',
      // initAsync: false,
      interpolation: { escapeValue: true },
      // preload: ['en', 'nl'],
      react: { useSuspense: true },
      supportedLngs: ['en', 'nl'],
    });

  return i18n;
});
