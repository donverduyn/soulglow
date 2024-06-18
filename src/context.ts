import {
  pipe,
  Layer,
  Context,
  Ref,
  SynchronizedRef,
  type ManagedRuntime,
  PubSub,
} from 'effect';
import { createRuntimeContext } from 'common/hoc/withRuntime';
// import { DevTools } from '@effect/experimental';

// const rootLayer = pipe(
//   // DevTools.layer(),
//   Layer.merge(Logger.minimumLogLevel(LogLevel.Debug))
// );

export type RuntimeContext<T> = React.Context<
  React.MutableRefObject<ManagedRuntime.ManagedRuntime<T, never> | null>
>;

// export class AppConfig extends Context.Tag('AppConfig')<
//   AppConfig,
//   Ref.Ref<{ apiUrl: string }>
// >() {}

// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export class HelloRef extends Context.Tag('Hello')<
  HelloRef,
  Ref.Ref<number>
>() {}

type Message<T extends Record<string, unknown>> = {
  message: string;
  payload: T;
};

export class MessageBus extends Context.Tag('@App/MessageBus')<
  MessageBus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PubSub.PubSub<Message<any>>
>() {}

export const AppRuntime = createRuntimeContext(
  pipe(
    Layer.effect(HelloRef, SynchronizedRef.make(0)),
    Layer.merge(Layer.effect(MessageBus, PubSub.unbounded()))
  )
);
