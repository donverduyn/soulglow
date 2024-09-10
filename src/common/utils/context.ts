import React from 'react';
import { Effect, pipe, type Layer, type ManagedRuntime } from 'effect';

export const createRuntimeContext = <T>(layer: Layer.Layer<T>) => {
  return React.createContext<
    ManagedRuntime.ManagedRuntime<T, never> | undefined
    // we abuse context here to pass through the layer
  >(layer as unknown as ManagedRuntime.ManagedRuntime<T, never>);
};

export type RuntimeContext<T> = React.Context<
  ManagedRuntime.ManagedRuntime<T, never> | undefined
>;

export const fromLayer = <A, E, R, TResult>(
  layer: Effect.Effect<A, E, R>,
  cb: (arg: A) => TResult
) => pipe(layer, Effect.andThen(cb));
