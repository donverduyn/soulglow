import { Console, Effect, Layer, ManagedRuntime, pipe, Queue } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import * as Tags from './tags';

// type tags = [GetContextType<typeof AppRuntime>];

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// type InferServices<T extends readonly any[]> = {
//   [K in keyof T]: T[K] extends Context.Tag.Identifier<T[K]>
//     ? Context.Tag.Service<T[K]>
//     : never;
// };

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
  Layer.scopedDiscard(
    Effect.gen(function* () {
      const stream = yield* Tags.InboundQueue;
      const item = yield* Queue.take(stream);
      yield* Console.log('[EndpointPanel/InboundQueue]', item);
    }).pipe(Effect.forever, Effect.forkScoped)
  ),
  Layer.provideMerge(
    Layer.effect(Tags.InboundQueue, Queue.unbounded<EventType<unknown>>())
  ),
  Layer.merge(Layer.succeed(Tags.Foo, 'foo')),
  createRuntimeContext
);
