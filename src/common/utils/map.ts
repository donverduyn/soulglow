// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from 'effect';
import { Call, type Tuples } from 'hotscript';

export type AnyKey = string | number | symbol;
export type KeyType<Key, TagKey, Tag = any, TagShape = any> =
  | (Key extends AnyKey ? Key : never)
  | Context.TagClass<Tag, TagKey, TagShape>;

// Because either Key or TagKey cannot be inferred, one of them falls back to AnyKey because of the keyof T constraint. This allows either Key or TagKey to demand the most specific type in the intersection Key & TagKey, effectively keeping the literal type of the actual key.

export interface TypedMap<T extends Record<AnyKey, unknown>, KeyTypes = any[]> {
  get<Key extends keyof T, TagKey extends keyof T, Tag, TagShape>(
    key: KeyType<Key, TagKey, Tag, TagShape>
  ): T[Key & TagKey];
  keys(): KeyTypes;
  set<Key extends keyof T, TagKey extends keyof T, Tag, TagShape>(
    k: KeyType<Key, TagKey, Tag, TagShape>,
    v: T[Key & TagKey]
  ): void;
}

// This validates if the type of the value matches the shape of a tag, when used as a key. Both an instance and factory are allowed. TagShape is inferred through KeyType.

type InferValue<TagShape, Value> = TagShape extends never
  ? Value
  : TagShape | ((...args: any[]) => TagShape);

export const withKey =
  <
    T extends Record<AnyKey, unknown>,
    Key extends keyof T,
    KeyTypes,
    TagKey extends keyof T,
    TagShape,
    Tag,
    Value,
  >(
    key: KeyType<Key, TagKey, Tag, TagShape>,
    value: InferValue<TagShape, Value>
  ) =>
  (createMap: () => TypedMap<T, KeyTypes>) => {
    return () => {
      const map = createMap();
      map.set(key as keyof T, value as T[keyof T]);
      return map as TypedMap<
        T & Record<Key & TagKey, Value>,
        Call<
          Tuples.Append,
          IsPrimitiveKey<Key> extends true ? Key : Tag,
          KeyTypes extends never[] ? [] : KeyTypes
        >
      >;
    };
  };

// TODO: find a way to use AnyKey (including symbol doesn't work, possibly because it overlaps with TagKey)
type IsPrimitiveKey<T> = T extends string | number ? true : false;

export function createTypedMap<T>() {
  const data = new Map();
  const keyCache = new Map();

  return {
    get: <K extends keyof T>(key: K) => {
      return data.get(Context.isTag(key) ? key.key : key) as T[K];
    },
    keys: () => {
      return Array.from(data.keys()).map(
        (key) => keyCache.get(key) as keyof T
      ) as (keyof NoInfer<T>)[];
    },
    set: <K extends keyof T>(key: K, value: T[K]) => {
      const k = Context.isTag(key) ? key.key : key;
      data.set(k, value);
      keyCache.set(k, key);
    },
  };
}
