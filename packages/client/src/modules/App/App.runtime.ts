import {
  Client,
  fetchExchange,
  type GraphQLRequest,
  type OperationResult,
} from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  pipe,
  Layer,
  Effect,
  PubSub,
  Stream,
  Console,
  Queue,
  Deferred,
  Ref,
} from 'effect';
import { toAsyncIterable } from 'wonka';
import schema from '__generated/gql/introspection.client.json';
import * as Operations from '__generated/gql/operations';
import { createRuntimeContext } from 'common/utils/context';
import { browserLogger } from 'common/utils/effect';
import type { EventType } from 'common/utils/event';
import {
  createGraphQLResponseEvent,
  executeRequest,
} from 'common/utils/graphql';
import type { QueryType } from 'common/utils/query';
// import { generateGraphcacheUpdates } from 'common/utils/urql';
import { generateUpdatesFromDocuments } from 'common/utils/urql';
import { CommandBusService } from './effect/services/CommandBus.service';
import { ResponseBusService } from './effect/services/EventBus.service';
import { QueryBusService } from './effect/services/QueryBus.service';
import { UrqlService } from './effect/services/Urql.service';
import * as Tags from './tags';

const updates = generateUpdatesFromDocuments(Operations);

console.log('updates', updates);

// Object.keys(updates).forEach((key) => {
//   console.log(`--- ${key} ---`);
//   console.log(updates[key]);
// })

// for (const [mutationName, fn] of Object.entries(updates.mutation_root)) {
//   console.log(`--- ${mutationName} ---`);
//   console.log(fn.toString());
// }

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

const isInContainer =
  typeof process !== 'undefined' && process.env.REMOTE_CONTAINERS === 'true';

const url = `http://${isInContainer ? 'hasura' : 'localhost'}:8080/v1/graphql`;
const headers = {
  'X-Hasura-Admin-Secret': 'admin_secret',
};

const responseBusChannel = Layer.effect(
  Tags.ResponseBusChannel,
  PubSub.unbounded<EventType<unknown>>({
    // replay: Number.POSITIVE_INFINITY,
  })
);

const responseBus = Layer.effect(
  Tags.ResponseBus,
  Effect.andThen(Tags.ResponseBusChannel, (bus) => {
    return new ResponseBusService(bus, 'AppRuntime/ResponseBus');
  })
);

const queryBusChannel = Layer.effect(
  Tags.QueryBusChannel,
  PubSub.unbounded<QueryType<unknown>>()
);

const queryBus = Layer.effect(
  Tags.QueryBus,
  Effect.andThen(Tags.QueryBusChannel, (bus) => {
    return new QueryBusService(bus, 'AppRuntime/QueryBus');
  })
);

const commandBusChannel = Layer.effect(
  Tags.CommandBusChannel,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PubSub.unbounded<EventType<any>>()
);

const commandBus = Layer.effect(
  Tags.CommandBus,
  Effect.andThen(Tags.CommandBusChannel, (bus) => {
    return new CommandBusService(bus, 'AppRuntime/CommandBus');
  })
);

export const AppRuntime = pipe(
  Layer.scopedDiscard(
    Effect.gen(function* () {
      const urql = yield* Tags.UrqlClient;
      const queryBusChannel = yield* Tags.QueryBusChannel;
      const commandBusChannel = yield* Tags.CommandBusChannel;
      const responseBus = yield* Tags.ResponseBus;

      // Create a Ref to hold the array of active subscription keys
      const activeSubscriptionKeysRef = yield* Ref.make<string[]>([]);

      const streams: Stream.Stream<
        EventType<
          | { request: GraphQLRequest; topic: string }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          | { operationResult: OperationResult<any, any>; topic: string }
        >
      >[] = [
        Stream.fromPubSub(queryBusChannel),
        Stream.fromPubSub(commandBusChannel),
      ];

      // TODO: maybe use separate streams for query and command instead of merging them. this would help keep things more intuitive and typesafe.
      yield* pipe(
        streams,
        Stream.mergeAll({ concurrency: 'unbounded' }),
        Stream.tap((e) =>
          Console.log('[AppRuntime] Received on QueryBus/CommandBus', e)
        ),
        Stream.mapEffect((e) =>
          Effect.sync(() =>
            // @ts-expect-error
            executeRequest(urql, e.payload.request as unknown as GraphQLRequest)
          ).pipe(Effect.map((source) => ({ event: e, source })))
        ),
        Stream.flatMap(
          ({ source, event }) =>
            Stream.unwrap(
              Effect.gen(function* () {
                const topic = event.payload.topic;

                const activeKeys = yield* Ref.get(activeSubscriptionKeysRef);
                if (activeKeys.includes(topic)) {
                  console.log(
                    `[AppRuntime] Skipping subscription for topic: ${topic} (already active)`
                  );
                  return Stream.empty;
                }

                yield* Ref.update(activeSubscriptionKeysRef, (keys) => {
                  return keys.concat(topic);
                });

                const stopSignal = yield* Deferred.make<boolean>();
                yield* responseBus.registerExit(topic, () =>
                  Effect.gen(function* () {
                    yield* Deferred.succeed(stopSignal, true);
                    yield* Console.log(
                      `[AppRuntime] Subscription ended for topic: ${topic}`
                    );
                    yield* Ref.update(activeSubscriptionKeysRef, (keys) => {
                      const newKeys = keys.slice();
                      const index = newKeys.indexOf(topic);
                      if (index > -1) newKeys.splice(index, 1);
                      return newKeys;
                    });
                  })
                );

                return pipe(
                  Stream.fromAsyncIterable(
                    pipe(source, toAsyncIterable),
                    () => {}
                  ),
                  Stream.map((result) => ({ event, result })),
                  Stream.interruptWhen(Deferred.await(stopSignal))
                );
              })
            ),
          { concurrency: 'unbounded' }
        ),
        Stream.tap(({ result, event }) =>
          responseBus.publish(
            createGraphQLResponseEvent(result, event.payload.topic)
          )
        ),
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
          yield* Console.log('[AppRuntime] Published to ResponseBus', item);
        }
      }).pipe(Effect.forkScoped)
    )
  ),

  // Layer.provide(
  //   Layer.scopedDiscard(
  //     Effect.gen(function* () {
  //       const responseBus = yield* Tags.ResponseBusChannel;
  //       const queryBus = yield* Tags.QueryBusChannel;
  //       const dequeue = yield* PubSub.subscribe(queryBus);

  //       while (true) {
  //         const item = yield* Queue.take(dequeue);
  //         yield* Console.log('[AppRuntime] Received on QueryBus', item);
  //         yield* responseBus.pipe(PubSub.publish(item));
  //       }
  //     }).pipe(Effect.forkScoped)
  //   )
  // ),

  Layer.provideMerge(
    Layer.effect(
      Tags.Urql,
      Tags.UrqlClient.pipe(Effect.andThen((c) => new UrqlService(c)))
    )
  ),
  Layer.provide(
    Layer.effect(
      Tags.UrqlClient,
      Effect.sync(() => {
        // const updates = generateGraphcacheUpdates(
        //   schema as unknown as IntrospectionSchema,
        // );

        // console.log('updates', updates);
        const client = new Client({
          exchanges: [
            // devtoolsExchange,
            // populateExchange({
            //   schema: schema as unknown as IntrospectionQuery,
            // }),
            cacheExchange({
              // 👇 enable logging
              // @ts-ignore
              debug: true,
              schema,
              updates,
              // updates: {
              //   mutation_root: {
              //     insertEndpointOne: (result, _args, cache) => {
              //       console.log('MUTATION RESULT:', result);
              //       console.log('ACTIVE QUERIES:', cache.inspectFields('Query'));

              //       cache.updateQuery({ query: EndpointPanel_EndpointList }, (data) => {
              //         console.log('PREV QUERY RESULT:', data);
              //         return {
              //           endpoint: [...data.endpoint, result.insertEndpointOne],
              //         };
              //       });
              //     },
              //   },
              // },
            }),
            // retryExchange({}),
            // offlineExchange({}),
            // subscriptionExchange({}),
            fetchExchange,
          ],
          fetchOptions: () => ({ headers }),
          url,
        });
        return client;
      })
    )
  ),

  Layer.provideMerge(queryBus),
  Layer.provide(queryBusChannel),

  Layer.provideMerge(commandBus),
  Layer.provide(commandBusChannel),

  Layer.provideMerge(responseBus),
  Layer.provide(responseBusChannel),

  Layer.merge(browserLogger),
  createRuntimeContext
);
