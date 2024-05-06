import React, { useState } from 'react';
import { isFunction } from 'effect/Function';
import { Call, O, S } from 'hotscript';
import { AnnotationsMap, observable, autorun } from 'mobx';
import { memoize } from 'common/utils/memoize';

// function mergeObservableObject<T extends Record<string, unknown>>(
//   target: T,
//   source: Partial<T>
// ) {
//   Object.keys(source).forEach((key) => {
//     const sourceVal = source[key as keyof T];
//     const targetVal = target[key as keyof T];

//     if (isPlainObject(sourceVal) && isObservableObject(targetVal)) {
//       mergeObservableObject(
//         targetVal as T[keyof T] & Record<string, unknown>,
//         sourceVal as T[keyof T] & Record<string, unknown>
//       );
//     } else {
//       set(target, key, sourceVal);
//     }
//   });
// }

// type SetFunction<T> = (fn: (state: T) => Partial<T>) => void;

export const useMobx = <T extends Record<string, unknown>>(
  initialize: () => T, //(set: SetFunction<T>) => T,
  annotations?: AnnotationsMap<T, never>
) =>
  useState(() => {
    const obs = observable(initialize(), annotations, {
      autoBind: true,
    });

    const get = memoize(
      <U extends Call<O.AllPaths, T>>(path: U) =>
        (): Call<O.Get<U>, T> => {
          const keys = [
            ...(path.split('.') as Call<S.Split<'.'>, U> & string[]),
          ];
          let value: unknown = obs;
          for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(value, key))
              return undefined as never;
            else {
              // @ts-expect-error unknown values
              value = value[key];
            }
          }
          return value as Call<O.Get<U>, T>;
        }
    );

    for (const key in obs) {
      if (isFunction(obs[key])) {
        const currentFn = obs[key] as <T>(a: T) => void;
        (obs[key] as <T>(a: T) => void) = <T>(a: T) => {
          // console.log('Calling:', key, a);
          currentFn(a);
        };
      }
    }
    return Object.assign(obs, { get });
  })[0];

export const useAutorun = (fn: () => void) =>
  React.useEffect(
    () =>
      autorun(() => {
        fn();
        if (process.env.NODE_ENV === 'development') {
          // trace();
        }
      }),
    []
  );

// export const useAction = (fn: () => void) =>
//   React.useEffect(() => {
//     runInAction(fn);
//   }, []);
