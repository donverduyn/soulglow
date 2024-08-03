import React from 'react';
import type { Layer, ManagedRuntime } from 'effect';

export const createRuntimeContext = <T>(layer: Layer.Layer<T>) => {
  return React.createContext<
    ManagedRuntime.ManagedRuntime<T, never>
    // we abuse context here to pass through the layer
  >(layer as unknown as ManagedRuntime.ManagedRuntime<T, never>);
};

export type RuntimeContext<T> = React.Context<
  ManagedRuntime.ManagedRuntime<T, never>
>;
