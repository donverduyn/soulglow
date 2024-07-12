import React from 'react';
import {
  pipe,
  Layer,
  Context,
  type ManagedRuntime,
  PubSub,
  Effect,
  Queue,
} from 'effect';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import type { AnyKey, TypedMap } from 'common/utils/map';
// import { DevTools } from '@effect/experimental';

// const rootLayer = pipe(
//   // DevTools.layer(),
//   Layer.merge(Logger.minimumLogLevel(LogLevel.Debug))
// );

// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export type Message<T = object> = {
  message: string;
  payload: T;
};

export class MessageBus extends Context.Tag('@App/MessageBus')<
  MessageBus,
  PubSub.PubSub<Message>
>() {}

// TODO: consider using a true global store/config, that stores data that is shared between modules after events. For example the endpoint url, when selected which is updated over the bus in the LightBulb module. By pulling from the global store/config we can set default values. It might make sense to make this more atomic, where the defaults are set in different modules based on a single entity.

// TODO: the problem with this hook is that it depends on the AppRuntime
// TODO: and therefore it should not be in common/hooks, unless we can parameterize it

// TODO: consider using a service that returns effects from its methods. This allows us to provide all dependencies once through the HOCs, using withRuntime(AppRuntime) and WithProvider(AppRuntime, AppProvider, [MessageBus])

export const useMessageBus = (deps: unknown[]) => {
  const publishMessage = React.useCallback(
    (message: Message) =>
      pipe(MessageBus, Effect.andThen(PubSub.publish(message))),
    []
  );

  const registerCallback = React.useCallback(
    (callback: <T>(message: Message<T>) => void) =>
      Effect.gen(function* () {
        const bus = yield* MessageBus;
        const dequeue = yield* bus.subscribe;
        const message = yield* Queue.take(dequeue);
        callback(message);
      }).pipe(Effect.scoped, Effect.forever, Effect.fork),
    deps
  );

  const publish = useRuntimeFn(AppRuntime, publishMessage);
  const register = useRuntimeFn(AppRuntime, registerCallback);
  return React.useMemo(() => ({ publish, register }), []);
};

export const createRuntimeContext = <T>(layer: Layer.Layer<T>) => {
  return React.createContext<
    React.MutableRefObject<ManagedRuntime.ManagedRuntime<T, never> | null>
    // we abuse context here to pass through the layer
  >(layer as unknown as React.MutableRefObject<null>);
};

export type RuntimeContext<T> = React.Context<
  React.MutableRefObject<ManagedRuntime.ManagedRuntime<T, never> | null>
>;

export const AppRuntime = createRuntimeContext(
  pipe(Layer.effect(MessageBus, PubSub.unbounded()))
);

export const createProviderContext = <T extends Record<AnyKey, unknown>, K>(
  createMap: () => TypedMap<T, K>
) => {
  return React.createContext<ResolveTypes<ReturnType<typeof createMap>>>(
    // we abuse context here to pass through the factory itself
    createMap as unknown as ResolveTypes<ReturnType<typeof createMap>>
  );
};

/* 
TODO: filter out
  [x: string]: unknown;
  [x: number]: unknown;
  [x: symbol]: unknown;
*/

type WithoutIndexSignatures<T> = {
  [K in keyof T as K extends AnyKey ? never : K]: T[K];
};

type ResolvedType<T> =
  T extends Record<AnyKey, unknown>
    ? {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [K in keyof T]: T[K] extends (...args: any[]) => any
          ? ReturnType<T[K]>
          : T[K];
      }
    : T;

export type ResolveTypes<T> =
  T extends TypedMap<infer A, infer B> ? TypedMap<ResolvedType<A>, B> : never;
