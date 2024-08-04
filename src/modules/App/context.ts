import { pipe, Layer, Context, PubSub, Effect } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { Message } from 'modules/App/models/message';
import { MessageBusService } from 'modules/App/services/MessageBusService';
// import { DevTools } from '@effect/experimental';

// const rootLayer = pipe(
//   // DevTools.layer(),
//   Layer.merge(Logger.minimumLogLevel(LogLevel.Debug))
// );

// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export class MessageBus extends Context.Tag('@App/MessageBus')<
  MessageBus,
  MessageBusService
>() {}

// TODO: consider using a true global store/config, that stores data that is shared between modules after events. For example the endpoint url, when selected which is updated over the bus in the LightBulb module. By pulling from the global store/config we can set default values. It might make sense to make this more atomic, where the defaults are set in different modules based on a single entity. Another solution would be to use the new replay feature of effect pubsub to replay the last message on a new subscription.

const layer = pipe(
  Layer.effect(
    MessageBus,
    pipe(
      PubSub.unbounded<Message>({ replay: 0 }),
      Effect.andThen((bus) => new MessageBusService(bus))
    )
  )
);

export const AppRuntime = createRuntimeContext(layer);
