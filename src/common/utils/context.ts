import React from 'react';
import { Effect, pipe, type Layer, type ManagedRuntime } from 'effect';

export const createRuntimeContext = <T>(layer: () => Layer.Layer<T>) => {
  return React.createContext<
    ManagedRuntime.ManagedRuntime<T, never> | undefined
    // TODO: consider keeping layer in the closure and obtain it in WithRuntime when needed. We can also modify the utility hooks to obtain the runtime from the closure instead of dropping it directly into useContext. This would avoid the need for abusing the context API here.
  >(layer() as unknown as ManagedRuntime.ManagedRuntime<T, never>);
};

export type RuntimeContext<T> = React.Context<
  ManagedRuntime.ManagedRuntime<T, never> | undefined
>;

export const fromLayer = <A, E, R, TResult>(
  layer: Effect.Effect<A, E, R>,
  cb: (arg: A) => TResult
) => pipe(layer, Effect.andThen(cb));
