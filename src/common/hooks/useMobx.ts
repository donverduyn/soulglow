import React, { useState } from 'react';
import { Call, O, S } from 'hotscript';
import { AnnotationsMap, observable, autorun, runInAction } from 'mobx';
import { identity, isFunction } from 'remeda';
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

    const lazyGet = memoize(
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

    const set = memoize(
      <U extends Call<O.AllPaths, T>, G extends Call<O.Get<U>, T>>(
        path: U,
        map: (state: G, value: G) => G = identity
      ) =>
        (value: G) => {
          const keys = [
            ...(path.split('.') as Call<S.Split<'.'>, U> & string[]),
          ];
          let target = obs;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!Object.prototype.hasOwnProperty.call(target, keys[i])) return; // Exit early if intermediate value is undefined
            // @ts-expect-error unknown values
            target = target[keys[i]];
          }

          const lastKey = keys[keys.length - 1];
          runInAction(() => {
            target[lastKey] = map(value, target[lastKey] as G);
          });
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
    return Object.assign(obs, { lazyGet, set });
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
