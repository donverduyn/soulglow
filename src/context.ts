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

// TODO: the problem with this hook is that it depends on the AppRuntime
// TODO: and therefore it should not be in common/hooks, unless we can parameterize it

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
  factory: () => TypedMap<T, K>
) => {
  return React.createContext<ReturnType<typeof factory>>(
    // we abuse context here to pass through the factory itself
    factory as unknown as ReturnType<typeof factory>
  );
};

export type ProviderContext<
  T extends Record<AnyKey, unknown>,
  K,
> = React.Context<React.MutableRefObject<TypedMap<T, K>>>;
