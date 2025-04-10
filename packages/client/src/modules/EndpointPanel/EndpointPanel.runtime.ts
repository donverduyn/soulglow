import {
  Console,
  Effect,
  Layer,
  pipe,
  PubSub,
  SubscriptionRef,
  Stream,
  Runtime,
  Queue,
  Ref,
  Option,
} from 'effect';
import { v4 as uuid } from 'uuid';
import {
  EndpointPanel_EndpointCreate,
  EndpointPanel_EndpointList,
  EndpointPanel_EndpointDelete,
} from '__generated/gql/operations';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { createGraphQLRequestEvent } from 'common/utils/graphql';
import { entityStoreLayer } from './effect/layers/EndpointStore.layer';
import { EventBusService } from './effect/services/EventBus.service';
import { InboundBusService } from './effect/services/InboundBus.service';
import { InitializerService } from './effect/services/Initializer.service';
import * as Tags from './tags';

const eventBusChannel = Layer.effect(
  Tags.EventBusChannel,
  PubSub.unbounded<EventType<unknown>>({
    // replay: Number.POSITIVE_INFINITY,
  })
);

const eventBus = Layer.effect(
  Tags.EventBus,
  Effect.andThen(Tags.EventBusChannel, (bus) => {
    return new EventBusService(bus);
  })
);

const inboundBusChannel = Layer.effect(
  Tags.InboundBusChannel,
  PubSub.unbounded<EventType<unknown>>()
);

const inboundBus = Layer.effect(
  Tags.InboundBus,
  Effect.andThen(Tags.InboundBusChannel, (bus) => {
    return new InboundBusService(bus);
  })
);

// TODO: think about how we want to use this to do single reads. Do we want to generalize across different pubsubs or not, maybe we do, what does that mean, that we use an abstract class like BusService to define it? The problem would be that there wouldn't be a separation between what is considered local to the pubsub and utilities for consumer land.

const getItem = Effect.gen(function* () {
  const ref = yield* Tags.InitializerRef;
  const runtime = yield* Effect.runtime<Tags.InboundBusChannel>();
  const runFork = Runtime.runFork(runtime);
  const valueRef = yield* SubscriptionRef.make(
    null as EventType<unknown> | null
  );

  yield* ref.changes.pipe(
    Stream.filter(
      (state): state is Tags.InitializerState => state.initialized === true
    ),
    Stream.mapEffect(({ register }) =>
      Effect.promise(() =>
        register('*', (e) =>
          runFork(pipe(valueRef, (ref) => Ref.update(ref, () => e)))
        )
      )
    ),
    Stream.mapEffect((unsubscribe) =>
      valueRef.changes.pipe(
        Stream.filter((value): value is EventType<unknown> => value !== null),
        Stream.take(1),
        Stream.mapEffect((e) =>
          pipe(Effect.promise(unsubscribe), Effect.zipRight(Effect.succeed(e)))
        ),
        Stream.runHead
      )
    ),
    Stream.tap((e) =>
      Console.log('[EndpointPanelRuntime] publishing', Option.getOrNull(e))
    ),
    Stream.runDrain
  );
});

export const EndpointPanelRuntime = pipe(
  // Layer.provide(
  Layer.scopedDiscard(
    Effect.gen(function* () {
      const ref = yield* Tags.InitializerRef;
      const store = yield* Tags.EntityStore;
      yield* ref.changes.pipe(
        Stream.filter(({ initialized }) => initialized === true),
        Stream.tap(() => Console.log('about to query the list')),
        Stream.tap(({ publishQuery, register }) =>
          Effect.sync(() => {
            const event = createGraphQLRequestEvent(
              EndpointPanel_EndpointList,
              {}
            );
            if (typeof publishQuery === 'function') {
              publishQuery(event);
            }
            if (typeof register === 'function') {
              register(event.payload.topic, (e) => {
                return Effect.sync(() =>
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  store.normalizeWithPurge(e.payload.operationResult.data)
                );
              });
            }
          })
        ),
        // Stream.take(1),
        Stream.runDrain
      );
    }).pipe(Effect.forkScoped)
  ),
  // ),

  Layer.provideMerge(entityStoreLayer),
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.InitializerRef;
        // const inboundBus = yield* Tags.InboundBusChannel;
        // const runtime = yield* Effect.runtime<Tags.InboundBusChannel>();
        // const runFork = Runtime.runFork(runtime);

        yield* ref.changes.pipe(
          Stream.filter(
            (state): state is Tags.InitializerState =>
              state.initialized === true
          ),
          Stream.tap((info) =>
            Console.log(
              '[EndpointPanelRuntime] initializing runtime',
              info.runtimeId
            )
          ),
          // Stream.mapEffect(({ register }) =>
          //   Effect.promise(() =>
          //     register('*', (e) => runFork(pipe(inboundBus, PubSub.publish(e))))
          //   )
          // ),

          Stream.runDrain
        );
      }).pipe(Effect.forkScoped)
    )
  ),
  // Layer.provide(
  //   Layer.scopedDiscard(
  //     Effect.gen(function* () {
  //       const ref = yield* Tags.InitializerRef;
  //       const eventBus = yield* Tags.EventBusChannel;
  //       const dequeue = yield* PubSub.subscribe(eventBus);

  //       while (true) {
  //         const item = yield* Queue.take(dequeue);
  //         const state = yield* Ref.get(ref);
  //         if (typeof state.publishQuery === 'function') {
  //           state.publishQuery(item);
  //         }
  //       }
  //     }).pipe(Effect.forkScoped)
  //   )
  // ),

  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const inbound = yield* Tags.EventBusChannel;
        const dequeue = yield* PubSub.subscribe(inbound);
        const ref = yield* Tags.InitializerRef;

        while (true) {
          const item = yield* Queue.take(dequeue);
          const { runtimeId } = yield* Ref.get(ref);
          yield* Console.log(
            `[EndpointPanelRuntime] receiving on EventBus ${String(runtimeId)}`,
            item
          );
        }
      }).pipe(Effect.forkScoped)
    )
  ),

  // Layer.provide(
  //   Layer.scopedDiscard(
  //     Effect.gen(function* () {
  //       const inbound = yield* Tags.InboundBusChannel;
  //       const dequeue = yield* PubSub.subscribe(inbound);
  //       const ref = yield* Tags.InitializerRef;

  //       while (true) {
  //         const item = yield* Queue.take(dequeue);
  //         const { runtimeId } = yield* Ref.get(ref);
  //         yield* Console.log(
  //           `[EndpointPanelRuntime] receiving on InboundBus ${String(runtimeId)}`,
  //           item
  //         );
  //       }
  //     }).pipe(Effect.forkScoped)
  //   )
  // ),

  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.InitializerRef;
        yield* Effect.addFinalizer(() =>
          pipe(
            Ref.get(ref),
            Effect.tap(({ runtimeId }) =>
              Console.log('[EndpointPanelRuntime] finalizing', runtimeId)
            )
          )
        );
      })
    )
  ),
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const bus = yield* Tags.EventBusChannel;
        const ref = yield* Tags.InitializerRef;
        yield* pipe(
          Stream.fromPubSub(bus),
          Stream.filter((e) => e.type === 'ADD_ENDPOINT_REQUESTED'),
          Stream.mapEffect(() => {
            return Effect.gen(function* () {
              const event = createGraphQLRequestEvent(
                EndpointPanel_EndpointCreate,
                {
                  input: {
                    id: uuid(),
                    name: 'test',
                    url: 'http://localhost:8081',
                  },
                }
              );
              const state = yield* Ref.get(ref);
              if (typeof state.publishCommand === 'function') {
                console.log('sending to command bus');
                state.publishCommand(event);
              }
            });
          }),
          Stream.runDrain
        );
      }).pipe(Effect.forkScoped)
    )
  ),
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const bus = yield* Tags.EventBusChannel;
        const ref = yield* Tags.InitializerRef;
        yield* pipe(
          Stream.fromPubSub(bus),
          Stream.filter((e) => e.type === 'REMOVE_ENDPOINT_REQUESTED'),
          Stream.mapEffect((e) => {
            return Effect.gen(function* () {
              const event = createGraphQLRequestEvent(
                EndpointPanel_EndpointDelete,
                {
                  // @ts-expect-error
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  id: e.payload.id,
                  // input: {
                  //   id: uuid(),
                  //   name: 'test',
                  //   url: 'http://localhost:8081',
                  // },
                }
              );
              const state = yield* Ref.get(ref);
              if (typeof state.publishCommand === 'function') {
                console.log('sending to command bus');
                state.publishCommand(event);
              }
            });
          }),
          Stream.runDrain
        );
      }).pipe(Effect.forkScoped)
    )
  ),

  Layer.merge(eventBus),
  Layer.provide(eventBusChannel),

  Layer.merge(inboundBus),
  Layer.provide(inboundBusChannel),

  Layer.merge(
    Layer.effect(
      Tags.Initializer,
      Effect.gen(function* () {
        const ref = yield* Tags.InitializerRef;
        return new InitializerService(ref);
      })
    )
  ),
  Layer.provide(
    Layer.effect(
      Tags.InitializerRef,
      SubscriptionRef.make(Tags.createInitializerState())
    )
  ),
  createRuntimeContext
);
