import type { Booleans, Fn, Tuples, Call, ComposeLeft } from 'hotscript';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import type { IsNever } from 'type-fest';
import { memoize } from 'common/utils/memoize';
import type { default as DataTypeEN } from './../public/locales/en/translation.json';
import type { default as DataTypeNL } from './../public/locales/nl/translation.json';

export type Locales = [typeof DataTypeEN, typeof DataTypeNL];

export const isTranslationAvailable =
  <Locales extends Record<string, string>[]>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Labels extends Record<any, any>>(labels: Labels) =>
    labels as unknown as Call<TranslationAvailable<Labels>, Locales>;

interface ContainsFn<T> extends Fn {
  return: IsNever<Exclude<keyof T, keyof this['arg0']>>;
}

type TranslationAvailable<T> = ComposeLeft<
  [
    Tuples.Map<ContainsFn<T>>,
    Tuples.Some<Booleans.Extends<false>>,
    Booleans.Not,
  ]
>;

export const initializeI18N = memoize(
  (callback?: (i18n: typeof i18next) => void) => {
    void i18next
      .use(Backend)
      .use(LanguageDetector)
      .init<HttpBackendOptions>(
        {
          backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
          fallbackLng: 'en',
          // lng: 'cimode',
          // lng: 'nl',
          interpolation: { escapeValue: true },
          // preload: ['en', 'nl'],
          react: { useSuspense: true },
          supportedLngs: ['en', 'nl'],
        },
        () => (callback ? callback(i18next) : undefined)
      );

    return i18next;
  }
);
