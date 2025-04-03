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
} from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { endpointStoreLayer } from './effect/layers/EndpointStore.layer';
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

export const EndpointPanelRuntime = pipe(
  endpointStoreLayer,
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.InitializerRef;
        const inboundBus = yield* Tags.InboundBusChannel;
        const runtime = yield* Effect.runtime<Tags.InboundBusChannel>();
        const runFork = Runtime.runFork(runtime);

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
          Stream.mapEffect(({ register }) =>
            Effect.promise(() =>
              register((e) => runFork(pipe(inboundBus, PubSub.publish(e))))
            )
          ),
          // Stream.tap((v) => {
          //   return Effect.gen(function* () {
          //     yield* Effect.sleep(3000);
          //     yield* Effect.promise(v);
          //   })
          // }),
          Stream.runDrain
        );
      }).pipe(Effect.forkScoped)
    )
  ),
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.InitializerRef;
        const eventBus = yield* Tags.EventBusChannel;
        const dequeue = yield* PubSub.subscribe(eventBus);

        while (true) {
          const item = yield* Queue.take(dequeue);
          const state = yield* Ref.get(ref);
          if (typeof state.publishQuery === 'function') {
            state.publishQuery(item);
          }
        }
      }).pipe(Effect.forkScoped)
    )
  ),

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

  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const inbound = yield* Tags.InboundBusChannel;
        const dequeue = yield* PubSub.subscribe(inbound);
        const ref = yield* Tags.InitializerRef;

        while (true) {
          const item = yield* Queue.take(dequeue);
          const { runtimeId } = yield* Ref.get(ref);
          yield* Console.log(
            `[EndpointPanelRuntime] receiving on InboundBus ${String(runtimeId)}`,
            item
          );
        }
      }).pipe(Effect.forkScoped)
    )
  ),

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
