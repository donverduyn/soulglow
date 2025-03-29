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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDisplayName = <C extends React.FC<any> | undefined>(
  Component: C,
  prefix: string
) => {
  const extraField = (Component as unknown as { type?: { name?: string }})?.type?.name;
  return `${prefix}(${(Component && (Component.displayName || Component.name || extraField)) || 'Component'})`;
};

// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true,
  // Don't redefine `displayName`,
  // it's defined as getter-setter pair on `memo` (see #3192).
  displayName: true
}

export function copyStaticProperties(base: any, target: any) {
  Object.keys(base).forEach(function(key) {
    if (!hoistBlackList[key]) {
      // @ts-expect-error wrong return type
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key));
    }
  });
}
