import React from 'react';
import { Context, Effect, flow, Layer, pipe } from 'effect';
import type { Call, Fn, Tuples } from 'hotscript';
import {
  createEntityStore,
  withFiltered,
  withSelected,
} from 'common/utils/entity';
import {
  createTypedMap,
  withKey as register,
  type AnyKey,
  type KeyType,
} from 'common/utils/map';
import { createProviderContext, createRuntimeContext } from 'context';
import type { Endpoint } from './models/Endpoint';

export class EndpointStore extends Context.Tag('@EndpointPanel/EndpointStore')<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class Hello extends Context.Tag('@EndpointPanel/Hello')<
  Hello,
  HelloService
>() {}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected,
  withFiltered
);

const createHelloService = (store: ReturnType<typeof createEndpointStore>) =>
  new HelloService(store);

// map tokens to optimistic factory providers
const createProviderMap = pipe(
  createTypedMap,
  register(EndpointStore, createEndpointStore),
  register(Hello, createHelloService)
);

// TODO: find a way to lazily create the provider map during layer creation
const providerFactories = createProviderMap();

const layer = pipe(
  Layer.effect(
    Hello,
    pipe(EndpointStore, Effect.andThen(flow(providerFactories.get(Hello))))
  ),
  Layer.provideMerge(
    Layer.effect(
      EndpointStore,
      Effect.sync(() => {
        console.log('store created from effect');
        return Object.assign(createEndpointStore(), { id: 'real' });
      })
    )
  )
);

class HelloService {
  constructor(private store: ReturnType<typeof createEndpointStore>) {}

  showId() {
    // @ts-expect-error id is not a property of the store
    console.log(this.store.id);
  }
}

export const EndpointPanelRuntime = createRuntimeContext(layer);

export const createStoreContext = <T>(value: T) => {
  return React.createContext<T>(value);
};

export const StoreContext = createStoreContext<{
  current: ReturnType<typeof createEndpointStore>;
} | null>(null);

export const EndpointPanelProvider = createProviderContext(createProviderMap);

// the goal is to map over all of the keys, to automatically create the layers. this way there is a single map where we assign the tags to the values. by mapping every tuple to withKey and get the resulting types in a tuple, we can keep type safety in the layers and in withProvider HOC.
