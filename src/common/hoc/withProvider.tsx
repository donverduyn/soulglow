import * as React from 'react';
import { Context, Effect, identity, pipe } from 'effect';
import type { Call, Fn, Tuples } from 'hotscript';
import { useAsync } from 'common/hooks/useAsync';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { type AnyKey, type TypedMap } from 'common/utils/map';
import type { RuntimeContext } from 'context';

export type InferResult<T, R> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Context.TagClass<infer Self, any, infer Shape>
    ? Self extends R
      ? Shape
      : never
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnTypeOrValue<T> = T extends (...args: any[]) => any
  ? ReturnType<T>
  : T;

interface ResolveTagFn<R> extends Fn {
  return: ReturnTypeOrValue<InferResult<this['arg0'], R>>;
}

// TODO: constrain the type of tags to be available in the requirements R and provider (possibly through map.keys which infers as a tuple of tags).
// TODO: constrain the type of the provider to be in accordance with R
export function WithProvider<
  R,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TagList extends Array<Context.TagClass<any, any, any>>,
  TagRecord extends Record<AnyKey, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  KeyTypes extends any[],
>(
  Runtime: RuntimeContext<R>,
  Provider: React.Context<TypedMap<TagRecord, KeyTypes>>,
  tags: [...TagList]
) {
  return <P extends object>(Component: React.FC<P>) => {
    const Wrapped = (props: P) => {
      // we actually pass the factory during context creation, so we can use it here. Note that the values are also factories, when the map is created, even though we removed the function types
      const createMap = React.useContext(Provider) as unknown as () => TypedMap<
        TagRecord,
        KeyTypes
      >;

      const map = createMap();
      const selectedTags = map
        .keys()
        .filter(Context.isTag)
        .filter((tag) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tags.includes(tag as Context.TagClass<any, any, any>)
        ) as typeof tags;

      const getValues = React.useCallback(
        () =>
          selectedTags.map((tag) => {
            const value = map.get(tag);

            // TODO: consider a solution for dependency injection at the factory level instead of the effect level
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return typeof value === 'function' ? value() : value;
          }) as Call<Tuples.Map<ResolveTagFn<R>>, typeof selectedTags>,
        [selectedTags, map]
      );

      const getServices = useRuntimeFn(
        Runtime,
        pipe(selectedTags, Effect.forEach(identity), Effect.delay(1000))
      );

      const { data } = useAsync(
        () => getServices(null),
        getValues,
        (result, current) => {
          result.forEach(
            <T,>(instance: T & { merge?: (arg: T) => void }, index: number) => {
              instance.merge?.(current[index] as T);
              map.set(
                selectedTags[index],
                instance as Parameters<typeof map.set>[1]
              );
            }
          );
        }
      );

      // this runs once for the optimistic sync, once for real async
      selectedTags.forEach((tag, index) => {
        map.set(tag, data[index] as Parameters<typeof map.set>[1]);
      });

      return (
        <Provider.Provider value={map}>
          <Component {...props} />
        </Provider.Provider>
      );
    };
    Wrapped.displayName = `WithProvider`;
    return React.memo(Wrapped);
  };
}
