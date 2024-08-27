import {
  Console,
  Context,
  Effect,
  Layer,
  pipe,
  String,
  Stream,
  Runtime,
} from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createEndpoint, type Endpoint } from './models/Endpoint';

const PREFIX = '@EndpointPanel';

export class EndpointStore extends Context.Tag(`${PREFIX}/EndpointStore`)<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class EndpointCore extends Context.Tag(`${PREFIX}/EndpointCore`)<
  EndpointCore,
  Stream.Stream<string>
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
  Stream.Stream<void>
>() {}

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
      [EndpointStore, World] as const,
      Effect.all,
      Effect.andThen((deps) => new HelloService(...deps))
    )
  ),
  Layer.provide(
    Layer.effect(
      World,
      pipe(
        [EndpointStore] as const,
        Effect.all,
        Effect.andThen((deps) => new WorldService(...deps))
      )
    )
  ),
  Layer.provideMerge(
    Layer.scoped(
      EndpointStore,
      Effect.gen(function* () {
        const core = yield* EndpointCore;
        const foo = yield* Foo;
        const runFork = yield* Effect.runtime().pipe(
          Effect.andThen(Runtime.runFork)
        );

        // const fiber2 = runFork(
        //   core.pipe(Stream.tap(Console.log), Stream.runDrain)
        // );
        // yield* Effect.addFinalizer(() => Fiber.interrupt(fiber2));

        const store = createEndpointStore();
        const endpoint = createEndpoint();

        // TODO: consider using persistent storage instead of recreating the first endpoint every time (because it will overwrite the previous one)
        store.add(endpoint);
        store.selectById(endpoint.id);
        return store;
      })
    )
  ),
  Layer.provide(Layer.succeed(Foo, Stream.fromEventListener(window, 'click'))),
  Layer.provide(
    Layer.effect(
      EndpointCore,
      Effect.sync(() =>
        Stream.asyncPush<string>((emit) =>
          Effect.acquireRelease(
            Effect.gen(function* () {
              yield* Effect.log('subscribing');
              return setInterval(() => emit.single('tick'), 1000);
            }),
            (handle) =>
              Effect.gen(function* () {
                yield* Effect.log('unsubscribing');
                clearInterval(handle);
              })
          )
        )
      )
    )
  )
);

const createEndpointStore = pipe(createEntityStore<Endpoint>, withSelected);
export const EndpointPanelRuntime = createRuntimeContext(layer);
