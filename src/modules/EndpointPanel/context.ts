import {
  Console,
  Context,
  Effect,
  Layer,
  pipe,
  String,
  Stream,
  Fiber,
  PubSub,
  Runtime,
  Queue,
  Take,
  Chunk,
} from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createEndpoint } from './models/Endpoint';
import type { Endpoint } from 'common/models/endpoint/endpoint';

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

export class Bar extends Context.Tag(`${PREFIX}/Bar`)<Bar, string>() {}

class WorldService {
  constructor(private hello: ReturnType<typeof createEndpointStore>) {
    // console.log('WorldService', this.hello);
  }

  sayWorld = Effect.sync(() => 'World!');
}

class HelloService {
  constructor(
    private store: ReturnType<typeof createEndpointStore>,
    private world: WorldService
  ) {}

  sayHello = pipe(
    this.world.sayWorld,
    Effect.andThen((t) => String.concat('Hello ', t)),
    Effect.andThen(Console.log)
  );

  showCount() {
    return this.store.count.get();
  }
}
const layer = pipe(
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
      pipe(
        Effect.all([EndpointStore] as const),
        Effect.andThen((deps) => new WorldService(...deps))
      )
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

        // yield* Queue
        // TODO: think about using runIntoPubSub instead of runDrain, so we can inject the pubsub across different layers, preventing the problem of instantiating multiple actors across different layers, because the layer currently returns a stream that is recreated.
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

        // const eventStreamFiber2 = runFork(adder.pipe(Stream.runDrain));
        // yield* Effect.addFinalizer(() => Fiber.interrupt(eventStreamFiber2));

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
    Layer.succeed(Foo, Stream.fromEventListener<PointerEvent>(window, 'click'))
  ),
  Layer.provide(Layer.succeed(Bar, 'bar')),
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

const createEndpointStore = pipe(createEntityStore<Endpoint>, withSelected);
export const EndpointPanelRuntime = createRuntimeContext(layer);
