import { pipe, Layer, Effect, PubSub, Stream, Console } from 'effect';
import type { CommandType } from 'common/utils/command';
import { createRuntimeContext } from 'common/utils/context';
import { browserLogger } from 'common/utils/effect';
import type { EventType } from 'common/utils/event';
import type { QueryType } from 'common/utils/query';
import { CommandBusProvider } from './effect/providers/CommandBusProvider';
import { EventBusProvider } from './effect/providers/EventBusProvider';
import { QueryBusProvider } from './effect/providers/QueryBusProvider';
import * as Tags from './tags';

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

const eventBusChannel = Layer.effect(
  Tags.EventBusChannel,
  PubSub.unbounded<EventType<unknown>>({
    // replay: Number.POSITIVE_INFINITY,
  })
);

const eventBus = Layer.effect(
  Tags.EventBus,
  Effect.andThen(Tags.EventBusChannel, (bus) => {
    return new EventBusProvider(bus);
  })
);

const queryBusChannel = Layer.effect(
  Tags.QueryBusChannel,
  PubSub.unbounded<QueryType<unknown>>()
);

const queryBus = Layer.effect(
  Tags.QueryBus,
  Effect.andThen(Tags.QueryBusChannel, (bus) => {
    return new QueryBusProvider(bus);
  })
);

const commandBusChannel = Layer.effect(
  Tags.CommandBusChannel,
  PubSub.unbounded<QueryType<unknown>>()
);

const commandBus = Layer.effect(
  Tags.CommandBus,
  Effect.andThen(Tags.CommandBusChannel, (bus) => {
    return new CommandBusProvider(bus);
  })
);

export const AppRuntime = pipe(
  Layer.scopedDiscard(
    Effect.gen(function* () {
      const eventBusChannel = yield* Tags.EventBusChannel;
      const queryBusChannel = yield* Tags.QueryBusChannel;
      const commandBusChannel = yield* Tags.CommandBusChannel;

      type BaseMessage =
        | EventType<unknown>
        | QueryType<unknown>
        | CommandType<unknown>;

      const streams: Stream.Stream<BaseMessage>[] = [
        Stream.fromPubSub(eventBusChannel),
        Stream.fromPubSub(queryBusChannel),
        Stream.fromPubSub(commandBusChannel),
      ];

      yield* pipe(
        streams,
        Stream.mergeAll({ concurrency: 'unbounded' }),
        Stream.tap((message) => Console.log('[AppRuntimeChannels]', message)),
        Stream.runDrain,
        Effect.forkScoped
      );
    })
  ),
  Layer.merge(eventBus),
  Layer.provide(eventBusChannel),

  Layer.merge(queryBus),
  Layer.provide(queryBusChannel),

  Layer.merge(commandBus),
  Layer.provide(commandBusChannel),

  Layer.merge(browserLogger),
  createRuntimeContext
);
