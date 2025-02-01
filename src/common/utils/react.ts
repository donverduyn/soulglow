import * as React from 'react';
import { isPlainObject } from 'remeda';

export function isReactContext2<T>(
  variable: unknown
): variable is React.Context<T> {
  return (
    isPlainObject(variable) &&
    React.isValidElement(variable.Provider) &&
    React.isValidElement(variable.Consumer)
  );
}

export const isReactContext = <T>(variable: unknown): variable is T => {
  return (
    isPlainObject(variable) &&
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-expect-error $$typeof is a private property
    variable.$$typeof === React.createContext(null).$$typeof
  );
};

export type ExtractMeta<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends React.FC<any> ? Omit<T, keyof React.FC> : never;
