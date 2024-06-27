// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Context, Effect, Layer, pipe } from 'effect';
import {
  createEntityStore,
  withFiltered,
  withSelected,
} from 'common/utils/entity';
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

export const EndpointPanelRuntime = createRuntimeContext(
  Layer.effect(
    EndpointStore,
    Effect.sync(() => {
      console.log('store created from effect');
      return Object.assign(createEndpointStore(), { id: 'real' });
    })
  )
);

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

type AnyKey = string | number | symbol;
type KeyType<T, T1> =
  | (T extends AnyKey ? T : never)
  | Context.TagClass<any, T1, any>;

// we infer separately to keep the literal type of the tag key
// instead of falling back to AnyKey, because it is the common denominator between the two
interface TypedMap<T> {
  get<K extends keyof T, K1 extends keyof T>(key: KeyType<K, K1>): T[K & K1];
  set<K extends keyof T, K1 extends keyof T>(
    k: KeyType<K, K1>,
    v: T[K & K1]
  ): void;
}

export const withKey =
  <K extends keyof T, K1 extends keyof T, V, T extends Record<string, unknown>>(
    key: KeyType<K, K1>,
    value: V
  ) =>
  (createMap: () => TypedMap<T>) => {
    return () => {
      const map = createMap();
      const resultKey = Context.isTag(key) ? key.key : key;
      map.set(resultKey as keyof T, value as T[keyof T]);
      return map as TypedMap<T & Record<K & K1, V>>;
    };
  };

export function createTypedMap<T>() {
  const store = new Map();

  return {
    get: <K extends keyof T>(key: K) => {
      return store.get(Context.isTag(key) ? key.key : key) as T[K];
    },
    set: <K extends keyof T>(key: K, value: T[K]) => {
      store.set(Context.isTag(key) ? key.key : key, value);
    },
  };
}

const createMap = pipe(
  createTypedMap,
  withKey('id', 100),
  withKey('name', 'Initial Name'),
  withKey('isActive', false),
  withKey(EndpointStore, 'true'),
  withKey(DeviceRepo, 0)
);

const myMap = createMap();

myMap.set('id', 101);
myMap.set('name', 'Typed Map');
myMap.set('isActive', true);
myMap.set(EndpointStore, 'foo');

const id = myMap.get('id'); // number
const name = myMap.get('name'); // string
const isActive = myMap.get('isActive'); // boolean
const store = myMap.get(EndpointStore); // string
const repo = myMap.get(DeviceRepo); // number

const ProviderContext = createProviderContext([DeviceRepo]);
