// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Context, Effect, Layer, pipe } from 'effect';
import {
  createEntityStore,
  withFiltered,
  withSelected,
} from 'common/utils/entity';
import { createTypedMap, withKey } from 'common/utils/map';
import { createRuntimeContext } from 'context';
import { DeviceRepo } from 'modules/LightBulb/context';
import type { InferTagsNonEmpty } from './EndpointPanel';
import type { Endpoint } from './models/Endpoint';

export class EndpointStore extends Context.Tag('@EndpointPanel/EndpointStore')<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected,
  withFiltered
);

const layer = pipe(
  Layer.effect(
    EndpointStore,
    Effect.sync(() => {
      console.log('store created from effect');
      return Object.assign(createEndpointStore(), { id: 'real' });
    })
  ),
  Layer.merge(
    Layer.effect(
      EndpointStore,
      Effect.sync(() => createEndpointStore())
    )
  )
);

export const EndpointPanelRuntime = createRuntimeContext(layer);

export const createStoreContext = <T>(value: T) => {
  return React.createContext<T>(value);
};

export const StoreContext = createStoreContext<{
  current: ReturnType<typeof createEndpointStore>;
} | null>(null);

const createProviderContext = <R, S extends Context.TagClass<any, any, any>[]>(
  services: [...S]
) => {
  const map = new Map<S, InferTagsNonEmpty<S, R>>();
  return React.createContext(map);
};

const createMap = pipe(createTypedMap, withKey('hello', 0));
const map = createMap();

const ProviderContext = createProviderContext([DeviceRepo]);
