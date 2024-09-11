import {
  Console,
  Context,
  Effect,
  Layer,
  pipe,
  Stream,
  Fiber,
  PubSub,
  Runtime,
  Queue,
  Take,
  Chunk,
} from 'effect';
import type { Endpoint } from 'common/models/endpoint/endpoint';
import { createRuntimeContext } from 'common/utils/context';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createEndpoint } from './models/Endpoint';
import { HelloService } from './services/HelloService';
import { WorldService } from './services/WorldService';

const PREFIX = '@EndpointPanel';

export class EndpointStore extends Context.Tag(`${PREFIX}/EndpointStore`)<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class EndpointCore extends Context.Tag(`${PREFIX}/EndpointCore`)<
  EndpointCore,
  PubSub.PubSub<Take.Take<string>>
>() {}

export class Hello extends Context.Tag(`${PREFIX}/Hello`)<
  Hello,
  HelloService
>() {}

export class World extends Context.Tag(`${PREFIX}/World`)<
  World,
  WorldService
>() {}

export class Foo extends Context.Tag(`${PREFIX}/Foo`)<
  Foo,
  Stream.Stream<PointerEvent>
>() {}

export const EndpointPanelRuntime = createRuntimeContext(layer);
const createEndpointStore = pipe(createEntityStore<Endpoint>, withSelected);

function layer() {
  return pipe(
    Layer.effect(
      Hello,
      pipe(
        Effect.all([EndpointStore, World] as const),
        Effect.andThen((deps) => new HelloService(...deps))
      )
    ),
    Layer.provide(
      Layer.effect(
        World,
        Effect.sync(() => new WorldService())
      )
    ),
    Layer.provideMerge(
      Layer.scoped(
        EndpointStore,
        Effect.gen(function* () {
          const core = yield* EndpointCore;
          const runFork = yield* Effect.runtime().pipe(
            Effect.andThen(Runtime.runFork)
          );

          const adder = core.pipe(
            PubSub.subscribe,
            Effect.andThen((sub) =>
              sub.pipe(
                Queue.take,
                Effect.andThen(Take.done),
                Effect.andThen(Chunk.last),
                Effect.tap(Console.log),
                Effect.forever
              )
            )
          );

          // TODO: consider abstracting away the setup and teardown of async fibers
          const eventStreamFiber = runFork(adder.pipe(Stream.runDrain));
          yield* Effect.addFinalizer(() => Fiber.interrupt(eventStreamFiber));

          const store = createEndpointStore();
          const endpoint = createEndpoint();

          // TODO: consider using persistent storage instead of recreating the first endpoint every time (because it will overwrite the previous one). we should persist both the entitystore and the actor on unmount, or think about keeping it alive, or restart it early, on mount, to avoid having async s ide effects after the first render, from replaying new events from the root event stream.
          store.add(endpoint);
          store.selectById(endpoint.id);
          return store;
        })
      )
    ),
    Layer.provide(
      Layer.succeed(
        Foo,
        Stream.fromEventListener<PointerEvent>(window, 'click')
      )
    ),
    Layer.provide(
      Layer.scoped(
        EndpointCore,
        pipe(
          Stream.asyncPush<string>(
            (emit) =>
              Effect.acquireRelease(
                Effect.sync(() => setInterval(() => emit.single(`🟢`), 1000)),
                (handle) => Effect.sync(() => clearInterval(handle))
              ),
            { bufferSize: 'unbounded' }
          ),
          // TODO: think about an alternative to asyncPush, because it doesn't make sense to go from push to pull and back to push
          Stream.toPubSub({ capacity: 'unbounded' })
        )
      )
    )
    // Layer.provide(
    //   Layer.scopedDiscard(Effect.addFinalizer(() => Console.log('cleanup')))
    // )
  );
}
