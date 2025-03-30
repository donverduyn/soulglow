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
  prefix?: string
) => {
  const extraField = (
    Component as unknown as { type?: { name?: string } } | undefined
  )?.type?.name;
  const componentName =
    (Component && (Component.displayName || Component.name || extraField)) ||
    'Component';
  return prefix ? `${prefix}(${componentName})` : componentName;
};

// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList = {
  $$typeof: true,
  compare: true,
  // Don't redefine `displayName`,
  // it's defined as getter-setter pair on `memo` (see #3192).
  displayName: true,
  render: true,
  type: true,
};

export function copyStaticProperties(
  base: Record<string, unknown>,
  target: Record<string, unknown>
) {
  Object.keys(base).forEach(function (key) {
    if (!hoistBlackList[key as keyof typeof hoistBlackList]) {
      Object.defineProperty(
        target,
        key,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error not allowed
        Object.getOwnPropertyDescriptor(base, key)
      );
    }
  });
}
