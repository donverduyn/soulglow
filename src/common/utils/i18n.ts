import type { Call, U } from 'hotscript';
import type { Simplify } from 'type-fest';
import type { default as DataTypeEN } from 'public/locales/en/translation.json';
import type { default as DataTypeNL } from 'public/locales/nl/translation.json';

// TODO: think about moving this closer to the translation files.
export type Locales = [typeof DataTypeEN, typeof DataTypeNL];

type CommonKeys<T extends Record<string, string>[]> = T extends [
  infer First extends Record<string, string>,
  ...infer Rest extends Record<string, string>[],
]
  ? keyof First & CommonKeys<Rest>
  : keyof T[number];

export type Labels<T extends Record<string, string>[]> = ExtractLabels<
  Call<U.ToTuple, CommonKeys<T>>
>;

export const isTranslationAvailable =
  <Locales extends Record<string, string>[]>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Labels extends Record<any, any>>(labels: Labels) =>
    labels as unknown as HasKey<Locales, Labels>;

type HasKey<
  T extends object[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  K extends Record<PropertyKey, any>,
> = T extends [infer First, ...infer Rest extends object[]]
  ? First extends K
    ? HasKey<Rest, K>
    : false
  : true;

type ExtractLabels<T extends readonly string[]> = {
  [K in T[number]]: K;
};

export const createLabels = <T extends string>(labelKeys: [...T[]]) =>
  Object.fromEntries(labelKeys.map((key) => [key, key])) as Simplify<
    ExtractLabels<typeof labelKeys>
  >;
