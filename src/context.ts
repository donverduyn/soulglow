import React from 'react';
import {
  pipe,
  Layer,
  Context,
  type ManagedRuntime,
  PubSub,
  Effect,
  Queue,
  flow,
  Scope,
  Exit,
} from 'effect';
import { createRuntimeContext } from 'common/hoc/withRuntime';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
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

// TODO: We currently use this file to export anything that's imported from above.
// TODO: Certain parts can likely be moved to common or should be separated.

export type RuntimeContext<T> = React.Context<
  React.MutableRefObject<ManagedRuntime.ManagedRuntime<T, never> | null>
>;

export const AppRuntime = createRuntimeContext(
  pipe(Layer.effect(MessageBus, PubSub.unbounded()))
);

// TODO: the problem with this hook is that it depends on the AppRuntime
// TODO: and therefore it should not be in common/hooks

export const useMessageBus = () => {
  const publishMessage = React.useCallback(
    (message: Message) =>
      pipe(MessageBus, Effect.andThen(PubSub.publish(message))),
    []
  );

  // const createScope = React.useCallback(flow(Scope.make, Effect.runSync), []);

  // const [scope, setScope] = React.useState(createScope);

  const registerCallback = React.useCallback(
    (callback: <T>(message: Message<T>) => void) =>
      Effect.gen(function* () {
        const bus = yield* MessageBus;
        const dequeue = yield* bus.subscribe;
        const message = yield* Queue.take(dequeue);
        callback(message);
      }).pipe(Effect.scoped, Effect.forever, Effect.fork),
    []
  );

  // React.useEffect(() => {
  //   console.log('useEffect')
  //   setScope(createScope());
  //   return () => {
  //     Effect.runFork(Scope.close(scope, Exit.void));
  //   };
  // }, []);

  const publish = useRuntimeFn(AppRuntime, publishMessage);
  const register = useRuntimeFn(AppRuntime, registerCallback);
  return React.useMemo(() => ({ publish, register }), []);
};
