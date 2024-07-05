import * as React from 'react';
import { Context, Effect, identity, pipe } from 'effect';
import type { Call, Fn, Tuples, _ } from 'hotscript';
import { useAsync } from 'common/hooks/useAsync';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import {
  createTypedMap,
  withKey,
  type AnyKey,
  type TypedMap,
} from 'common/utils/map';
import type { RuntimeContext } from 'context';
import {
  Hello,
  EndpointStore,
  EndpointPanelRuntime,
  EndpointPanelProvider,
} from 'modules/EndpointPanel/context';

export type InferResult<T, R> =
  T extends Context.TagClass<infer Self, infer Key, infer Shape>
    ? Shape extends R
      ? Self
      : never
    : never;

// The responsibiilty of withProvider is to instantiate all of the optimistic factories and then swap them with the actual values when the runtime is available.
// Technically it only adds a value to a context provder and returns a wrapped component, but it has a dependency on the runtime and the map of optimistic factories.

const test = WithProvider(EndpointPanelRuntime, EndpointPanelProvider, [
  Hello,
  EndpointStore,
]);

type InferTag<T> =
  T extends Context.TagClass<infer A, infer B, infer C>
    ? Context.TagClass<A, B, C>
    : never;

interface InferTagFn extends Fn {
  return: InferTag<this['arg0']>;
}

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
      // we actually pass the factory during context creation, so we can use it here
      const createMap = React.useContext(Provider) as unknown as () => TypedMap<
        TagRecord,
        KeyTypes
      >;

      const map = createMap();
      const filtered = Array.from(
        new Set(map.keys().filter(Context.isTag)).intersection(new Set(tags))
      ) as typeof tags;

      const values = filtered.map((tag) => {
        const value = map.get(tag);
        // this assumes we can just omit the dependencies with the optimistic factory
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return typeof value === 'function' ? value() : value;
      }) as Call<Tuples.Map<InferTagFn>, typeof filtered>;

      const result = pipe(createTypedMap, withKey('foo', 'bar'));

      const getAll = pipe(tags, Effect.forEach(Effect.map(identity)));
      const getServices = useRuntimeFn(Runtime, getAll);

      // both values and getServices return an array of values. We know that tags contains the keys that belong to these values, but we need to create a new typed map that maps the tags to the values.

      // The question is also how we want to solve this problem in terms of typing the Provider context, because it holds factories instead of values. This means that in order to get the right type, we would have to rethink where we instantiate the factories and if we have to do this inside createProviderContext.
      const { data } = useAsync(
        () => getServices(null),
        () => null
      );

      return (
        <Runtime.Provider value={runtimeRef}>
          <Component {...props} />
        </Runtime.Provider>
      );
    };
    Wrapped.displayName = `WithProvider`;
    return Wrapped as unknown as Call<Tuples.Map<InferTag<_>>, typeof tags>;
  };
}
