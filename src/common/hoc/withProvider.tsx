import * as React from 'react';
import { Context, Effect, identity, Layer, Runtime, pipe } from 'effect';
import type { B, Call, Fn, Tuples } from 'hotscript';
import { map } from 'remeda';
import { useAsync } from 'common/hooks/useAsync';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { type AnyKey, type TypedMap } from 'common/utils/map';
import type { RuntimeContext } from 'context';
import { layer } from 'modules/EndpointPanel/context';

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
  runtime: RuntimeContext<R>,
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
        return Effect.runSync(
          pipe(
            // TODO: either make the runtime available synchronously or find a way to provide the layer, which is now only available in withRuntime HOC
            Layer.toRuntime(layer),
            Effect.scoped,
            Effect.andThen(Runtime.runSync),
            Effect.andThen((runSync) =>
              // TODO: find a way to use the type of the tags
              runSync(pipe(selectedTags as unknown as [], Effect.all))
            )
          )
        );
      }, [selectedTags]);

      const getServices = useRuntimeFn(
        runtime,
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

      // TODO: the problem we have to solve, is that the return types of the layers should be inferrable from the tags outside of effect. Previously we did this using TypedMap, but since the source of truth is now the layers, we can no longer declare the types directly from there. Mapping the correct types here from both the result and optimistic result, requires a solution that maps a tuple to a tuple on the type level. We should consider using Context.Tag.Service<T> to infer the types from the tags and apply this to every item in a tuple.

      // const createContext = () => {
      //   const ctx = Context.empty().pipe(
      //     selectedTags.map()
      //   )
      // }
      // TODO: instead of using a map, use a Effect.Context instead, which also has a get method that resolves the associated type downstream?
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