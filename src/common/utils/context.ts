import React from 'react';
import {
  Effect,
  identity,
  pipe,
  type Layer,
  type ManagedRuntime,
} from 'effect';

export const createRuntimeContext = <T>(layer: Layer.Layer<T>) => {
  const context = React.createContext<
    ManagedRuntime.ManagedRuntime<T, never> | undefined
  >(undefined);
  return Object.assign(context, { layer });
};

export type RuntimeContext<T> = React.Context<
  ManagedRuntime.ManagedRuntime<T, never> | undefined
>;

export type GetContextType<T> = T extends RuntimeContext<infer U> ? U : never;

export const fromLayer = <A, E, R, TResult = Effect.Effect<A, E, R>>(
  layer: Effect.Effect<A, E, R>,
  cb: (arg: A) => TResult = identity as (arg: A) => TResult
) => pipe(layer, Effect.andThen(cb));
