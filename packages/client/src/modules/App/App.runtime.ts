import { Client, type AnyVariables, type TypedDocumentNode } from '@urql/core';
import { fetchExchange } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import { pipe, Layer, Effect, PubSub, Stream, Console, Queue } from 'effect';
import schema from '__generated/gql/introspection.urql.json';
import {
  EndpointPanel_EndpointById,
  EndpointPanel_EndpointList,
} from '__generated/gql/operations';
import type { CommandType } from 'common/utils/command';
import { createRuntimeContext } from 'common/utils/context';
import { browserLogger } from 'common/utils/effect';
import type { EventType as ResponseType } from 'common/utils/event';
import type { QueryType } from 'common/utils/query';
import { CommandBusService } from './effect/services/CommandBus.service';
import { ResponseBusService } from './effect/services/EventBus.service';
import { QueryBusService } from './effect/services/QueryBus.service';
import * as Tags from './tags';

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

const responseBusChannel = Layer.effect(
  Tags.ResponseBusChannel,
  PubSub.unbounded<ResponseType<unknown>>({
    // replay: Number.POSITIVE_INFINITY,
  })
);

const responseBus = Layer.effect(
  Tags.ResponseBus,
  Effect.andThen(Tags.ResponseBusChannel, (bus) => {
    return new ResponseBusService(bus);
  })
);

const queryBusChannel = Layer.effect(
  Tags.QueryBusChannel,
  PubSub.unbounded<QueryType<unknown>>()
);

const queryBus = Layer.effect(
  Tags.QueryBus,
  Effect.andThen(Tags.QueryBusChannel, (bus) => {
    return new QueryBusService(bus);
  })
);

const commandBusChannel = Layer.effect(
  Tags.CommandBusChannel,
  PubSub.unbounded<CommandType<unknown>>()
);

const commandBus = Layer.effect(
  Tags.CommandBus,
  Effect.andThen(Tags.CommandBusChannel, (bus) => {
    return new CommandBusService(bus);
  })
);

export const AppRuntime = pipe(
  Layer.scopedDiscard(
    Effect.gen(function* () {
      // const queryBusChannel = yield* Tags.QueryBusChannel;
      const commandBusChannel = yield* Tags.CommandBusChannel;
      // const responseBusChannel = yield* Tags.ResponseBusChannel;

      type BaseMessage =
        | ResponseType<unknown>
        | QueryType<unknown>
        | CommandType<unknown>;

      const streams: Stream.Stream<BaseMessage>[] = [
        // Stream.fromPubSub(responseBusChannel),
        // Stream.fromPubSub(queryBusChannel),
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

  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const responseBus = yield* Tags.ResponseBusChannel;
        const dequeue = yield* PubSub.subscribe(responseBus);

        while (true) {
          const item = yield* Queue.take(dequeue);
          yield* Console.log('[AppRuntime/ResponseBus]', item);
        }
      }).pipe(Effect.forkScoped)
    )
  ),

  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const responseBus = yield* Tags.ResponseBusChannel;
        const queryBus = yield* Tags.QueryBusChannel;
        const dequeue = yield* PubSub.subscribe(queryBus);

        while (true) {
          const item = yield* Queue.take(dequeue);
          yield* Console.log('[AppRuntime/QueryBus]', item);
          yield* responseBus.pipe(PubSub.publish(item));
        }
      }).pipe(Effect.forkScoped)
    )
  ),

  Layer.merge(queryBus),
  Layer.provide(queryBusChannel),

  Layer.merge(commandBus),
  Layer.provide(commandBusChannel),

  Layer.merge(responseBus),
  Layer.provide(responseBusChannel),

  Layer.merge(browserLogger),
  createRuntimeContext
);

const isCI = import.meta.env.CI === 'true';

const client = new Client({
  exchanges: [cacheExchange({ schema }), fetchExchange],
  fetchOptions: () => ({
    headers: {
      'X-Hasura-Admin-Secret': 'admin_secret',
    },
  }),
  url: `http://${isCI ? 'localhost' : 'hasura'}:8080/v1/graphql`,
});

export const runQuery = async () => {
  const result = await client.query(EndpointPanel_EndpointList, {}).toPromise();
  return result.data?.endpoint;
};

type MessageFactory = <TVariables extends AnyVariables, TResponse>(
  query: TypedDocumentNode<TResponse, TVariables>,
  variables: TVariables
) => {
  document: TypedDocumentNode<TResponse, TVariables>;
  variables: TVariables;
};

// Generic query factory function
const createMessage: MessageFactory = (document, variables) => ({
  document,
  variables,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test = createMessage(EndpointPanel_EndpointById, {
  id: '123',
});
