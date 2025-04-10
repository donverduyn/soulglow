import * as React from 'react';
import { useSyncExternalStore } from 'react';
import memoize from 'moize';

// Internal item and store types
type Item<T> = {
  expiresAt: number;
  value: T;
};

type Store<T> = {
  getSnapshot: () => T | null;
  setItem: (value: T, ttl: number) => void;
  subscribe: (cb: () => void) => () => void;
};

// Create a private, memoized store per ID
const createStore = memoize(<T>(id: symbol): Store<T> => {
  let item: Item<T> | null = null;
  const subscribers = new Set<() => void>();
  const notify = () => subscribers.forEach((cb) => cb());

  return {
    getSnapshot: () => {
      if (!item || item.expiresAt < Date.now()) {
        item = null;
        return null;
      }
      return item.value;
    },
    setItem: (value, ttl) => {
      item = {
        expiresAt: Date.now() + ttl,
        value,
      };
      notify();

      setTimeout(() => {
        if (item && item.expiresAt <= Date.now()) {
          item = null;
          notify();
        }
      }, ttl);
    },
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
  };
});

// Private ephemeral access layer
const ephemeralAccess = (() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = new WeakMap<symbol, Store<any>>();

  return {
    grant<T>(ttl = 10): [symbol, Store<T>] {
      const token = Symbol();
      const store = createStore<T>(token);
      session.set(token, store);
      setTimeout(() => session.delete(token), ttl);
      return [token, store];
    },
    resolve<T>(token: symbol): Store<T> | null {
      return session.get(token) ?? null;
    },
  };
})();

// Hook + setter using secure ephemeral access
export function useCachedItem<T>(idRef: symbol): T | null {
  const store = ephemeralAccess.resolve<T>(idRef);

  // Fallbacks prevent hook order change
  const subscribe = store?.subscribe ?? (() => () => {});
  const getSnapshot = store?.getSnapshot ?? (() => null);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function setCachedItem<T>(idRef: symbol, value: T, ttl: number) {
  const store = ephemeralAccess.resolve<T>(idRef);
  if (!store) return;
  store.setItem(value, ttl);
}

// Utility to create secure ID inside a component (memoized and unique)
export function useCachedItemId(): symbol {
  const id = React.useMemo(() => {
    const [token] = ephemeralAccess.grant();
    return token;
  }, []);
  return id;
}
