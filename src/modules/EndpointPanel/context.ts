import { Console, Context, Effect, Layer, pipe, String } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createEndpoint, type Endpoint } from './models/Endpoint';

const PREFIX = '@EndpointPanel';

export class EndpointStore extends Context.Tag(`${PREFIX}/EndpointStore`)<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class Hello extends Context.Tag(`${PREFIX}/Hello`)<
  Hello,
  HelloService
>() {}

export class World extends Context.Tag(`${PREFIX}/World`)<
  World,
  WorldService
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
    Layer.effect(
      EndpointStore,
      Effect.sync(() => {
        const store = createEndpointStore();
        const endpoint = createEndpoint();
        store.add(endpoint);
        // console.log('create endpoint store');
        store.selectById(endpoint.id);
        return store;
      })
    )
  )
);

const createEndpointStore = pipe(createEntityStore<Endpoint>, withSelected);
export const EndpointPanelRuntime = createRuntimeContext(layer);
