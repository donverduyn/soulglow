import React, { useState } from 'react';
import { Call, O, S } from 'hotscript';
import {
  AnnotationsMap,
  observable,
  autorun,
  runInAction,
  reaction,
  IReactionOptions,
} from 'mobx';
import { identity, isFunction } from 'remeda';
import { Simplify } from 'type-fest';
import { memoize } from 'common/utils/memoize';

export const useMobx = <T extends Record<string, unknown>>(
  initialize: () => T, //(set: SetFunction<T>) => T,
  annotations?: AnnotationsMap<T, never>
) =>
  useState(() => {
    const obs = observable(initialize(), annotations, {
      autoBind: true,
    });

    const lazyGet = memoize(
      <P extends Call<O.AllPaths, T>, V extends Call<O.Get<P>, T>, R>(
        path: P,
        map: (value: V) => R = identity
      ) => {
        const keys = [...(path.split('.') as Call<S.Split<'.'>, P> & string[])];
        return () => {
          let value: unknown = obs;
          for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(value, key))
              return undefined as never;
            else {
              // this doesn't change the observable
              // @ts-expect-error unknown values
              value = value[key];
            }
          }
          return map(value as V);
        };
      }
    );

    const set = memoize(
      <P extends Call<O.AllPaths, T>, S extends Call<O.Get<P>, T>, V>(
        path: P,
        map: (value: V, state: S) => S = (value) => value as unknown as S
      ) =>
        (value: V) => {
          const keys = [
            ...(path.split('.') as Call<S.Split<'.'>, P> & string[]),
          ];
          let target = obs;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!Object.prototype.hasOwnProperty.call(target, keys[i])) return; // Exit early if intermediate value is undefined
            // @ts-expect-error unknown values
            target = target[keys[i]];
          }

          const lastKey = keys[keys.length - 1];
          runInAction(() => {
            target[lastKey] = map(value, target[lastKey] as S);
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
    return Object.assign(obs, {
      lazyGet,
      set,
    });
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

export const useReaction = <T>(
  fn: () => T,
  effect: (value: T, prev: T) => void,
  options: IReactionOptions<T, false> = { delay: 100 }
) => {
  React.useEffect(() => reaction(fn, effect, options), []);
};
