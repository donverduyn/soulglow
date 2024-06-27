import { Context } from 'effect';

type AnyKey = string | number | symbol;
type KeyType<K, K1> =
  | (K extends AnyKey ? K : never)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Context.TagClass<any, K1, any>;

// If K or K1 cannot be inferred, they fall back to AnyKey because of the keyof T constraints.
// This allows either K or K1 to demand the specific type in the intersection.

interface TypedMap<T extends Record<AnyKey, unknown>> {
  get<K extends keyof T, K1 extends keyof T>(key: KeyType<K, K1>): T[K & K1];
  set<K extends keyof T, K1 extends keyof T>(
    k: KeyType<K, K1>,
    v: T[K & K1]
  ): void;
}

export const withKey =
  <K extends keyof T, K1 extends keyof T, V, T extends Record<AnyKey, unknown>>(
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
