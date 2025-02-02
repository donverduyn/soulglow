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

export type Labels<T extends Record<string, string>[]> = CommonKeys<T>;

export type HasTranslation<
  T extends object[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  K extends Record<PropertyKey, any>,
> = T extends [infer First, ...infer Rest extends object[]]
  ? First extends { [P in keyof K]: K[P] | string }
    ? HasTranslation<Rest, K>
    : false
  : true;

type ExtractLabels<T extends readonly string[]> = {
  [K in T[number]]: K;
};

export const createLabels = <T extends string>(labelKeys: [...T[]]) =>
  Object.fromEntries(labelKeys.map((key) => [key, key])) as Simplify<
    ExtractLabels<typeof labelKeys>
  >;
