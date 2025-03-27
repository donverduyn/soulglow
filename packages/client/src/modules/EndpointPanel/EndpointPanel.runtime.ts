import {
  Console,
  Effect,
  Layer,
  pipe,
  PubSub,
  Queue,
  Ref,
  Stream,
  SubscriptionRef,
} from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { endpointStoreLayer } from './effect/layers/EndpointStoreLayer';
import * as Tags from './tags';

export const EndpointPanelRuntime = pipe(
  endpointStoreLayer,
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.CountRef;
        yield* Stream.runDrain(
          ref.changes.pipe(
            Stream.tap((a) => Console.log('[EndpointPanelRuntime/CountRef]', a))
          )
        );
      }).pipe(Effect.forkScoped)
    )
  ),
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const count = yield* Tags.CountRef;
        const inbound = yield* Tags.Inbound;
        const dequeue = yield* PubSub.subscribe(inbound);

        while (true) {
          const item = yield* Queue.take(dequeue);
          yield* Ref.update(count, (n) => n + 1);
          yield* Console.log('[EndpointPanel/InboundQueue]', item);
        }
      }).pipe(Effect.forkScoped)
    )
  ),
  Layer.provideMerge(
    Layer.effect(Tags.Inbound, PubSub.unbounded<EventType<unknown>>())
  ),
  Layer.provideMerge(Layer.effect(Tags.CountRef, SubscriptionRef.make(0))),
  createRuntimeContext
);
