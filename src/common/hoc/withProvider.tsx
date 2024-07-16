import * as React from 'react';
import { Context, Effect, identity, pipe } from 'effect';
import type { B, Call, Fn, Tuples } from 'hotscript';
import { isFunction } from 'remeda';
import { useAsync } from 'common/hooks/useAsync';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { type AnyKey, type TypedMap } from 'common/utils/map';
import type { ResolveTypes, RuntimeContext } from 'context';
import { create, extractTags } from 'modules/EndpointPanel/context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isClass(impl: any): impl is { new (...args: any[]): any } {
  return (
    typeof impl === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(impl))
  );
}

interface IncludesFn<T> extends Fn {
  return: Call<Tuples.Find<B.Extends<this['arg0']>>, T> extends never
    ? false
    : true;
}

// checks if every element of T is included in TTarget
export type IncludedIn<TTarget, T> = Call<Tuples.Every<IncludesFn<TTarget>>, T>;

type Test = IncludedIn<[1, 2, 3], [1, 3, 2]>;

// TODO: constrain the type of tags to be available in the requirements R and provider (possibly through map.keys which infers as a tuple of tags).
// TODO: constrain the type of the provider to be in accordance with R
export function WithProvider<
  R,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Deps extends Array<Context.TagClass<any, any, any>>,
  TagRecord extends Record<AnyKey, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Keys extends any[],
>(
  Runtime: RuntimeContext<R>,
  Provider: React.Context<TypedMap<TagRecord, Keys>>,
  // TODO: intersection type omits never
  deps: [...Deps] // & IncludedIn<Keys, Deps> // TODO: needs to be converted to tag classes
) {
  return <P extends object>(Component: React.FC<P>) => {
    const Wrapped = (props: P) => {
      // we actually pass the factory during context creation, so we can use it here. Note that the values are also factories, when the map is created, but the context is already casted to the resolved type. For this reason, we infer from the tags again in mapResolve
      const createMap = React.useContext(Provider) as unknown as () => TypedMap<
        TagRecord,
        Keys
      >;

      const map = createMap();
      const selectedTags = Array.from(map.keys())
        .filter(Context.isTag)
        .filter((tag) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          deps.includes(tag as Context.TagClass<any, any, any>)
        ) as unknown as typeof deps; // TODO: needs constraint on deps

      const mapResolve = React.useCallback(() => {
        // TODO: ideally the type of TypedMap should be a subtype of Map
        const target = new Map() as unknown as ResolveTypes<
          TypedMap<TagRecord, Keys>
        >;
        const getTag = target.get.bind(target);

        selectedTags.forEach((tag) => {
          const impl = map.get(tag);

          // TODO: consider a solution for dependency injection at the factory level instead of the effect level. This constitutes ordering the instantiation, such that acc contains all the necessary dependencies for lookup.

          if (isClass(impl)) {
            const deps = extractTags(impl).map(getTag);
            // @ts-expect-error we inject the services instead of the tags
            const result = create(impl)(deps);
            target.set(tag, result as ReturnTypeOrValue<typeof impl>);
          } else if (isFunction(impl)) {
            const result = impl() as ReturnTypeOrValue<typeof impl>;
            target.set(tag, result);
          }
        });
        return Array.from(target.values());
      }, [selectedTags, map]);

      const getServices = useRuntimeFn(
        Runtime,
        pipe(selectedTags, Effect.forEach(identity), Effect.delay(1000))
      );

      const { data } = useAsync(
        () => getServices(null),
        () => mapResolve(),
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
      // if it rerenders afterwards it just reassigns the values
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

export type InferShape<T, R> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Context.TagClass<infer Self, any, infer Shape>
    ? Self extends R
      ? Shape
      : never
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnTypeOrValue<T> = T extends (...args: any[]) => any
  ? ReturnType<T>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends { new (...args: any[]): infer R }
    ? R
    : T;
