import {
  Console,
  Effect,
  Layer,
  ManagedRuntime,
  pipe,
  PubSub,
  Queue,
  Ref,
  Stream,
  SubscriptionRef,
} from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { endpointStoreLayer } from './effect/layers/layers';
import * as Tags from './tags';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
  const layerParent = Layer.succeed(Tags.Foo, 'foo');
  const runtimeParent = ManagedRuntime.make(layerParent);

  // TODO: think about the consequence of having Foo in Foobar Service type, maybe this is actually what we want, because we do provide our dependencies on the service level, not only at construction level.

  // TODO: try to use layer project etc, link the service of a tag
  Layer.service(Tags.Foo);

  const layerChild = pipe(
    Layer.succeed(
      Tags.Foobar,
      // Effect.gen(function* () {
      // const s = yield* Foo;
      Effect.andThen(Tags.Foo, (s) => s + 'bar')
      // })
    )
  );
  const runtimeChild = ManagedRuntime.make(layerChild);

  const program = Effect.gen(function* () {
    const effect = yield* Tags.Foobar;
    return effect;
  });

  const fromChild = Effect.runSync(Effect.provide(program, runtimeChild));
  const fromParent = Effect.provide(fromChild, runtimeParent);

  const result = Effect.runSync(fromParent);
  console.log(result); // prints foobar
}

export const EndpointPanelRuntime = pipe(
  endpointStoreLayer,
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.CountRef;
        yield* Stream.runDrain(ref.changes.pipe(Stream.tap(Console.log)));
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
  // Layer.merge(Layer.succeed(Tags.Foo, 'foo')),
  createRuntimeContext
);
