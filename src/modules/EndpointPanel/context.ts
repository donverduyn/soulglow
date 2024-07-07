import { Context, Effect, Layer, pipe } from 'effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createTypedMap, register } from 'common/utils/map';
import { createProviderContext, createRuntimeContext } from 'context';
import type { Endpoint } from './models/Endpoint';

export class EndpointStore extends Context.Tag('@EndpointPanel/EndpointStore')<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class Hello extends Context.Tag('@EndpointPanel/Hello')<
  Hello,
  HelloService
>() {}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected
);

const createHelloService = (store: ReturnType<typeof createEndpointStore>) =>
  new HelloService(store);

const createProviderMap = pipe(
  createTypedMap,
  register(EndpointStore, createEndpointStore),
  register(Hello, createHelloService)
);

const layer = pipe(
  Layer.effect(
    Hello,
    pipe(
      Effect.sync(createProviderMap),
      Effect.andThen((map) =>
        pipe(EndpointStore, Effect.andThen(map.get(Hello)))
      )
    )
  ),
  Layer.provideMerge(
    Layer.effect(
      EndpointStore,
      pipe(
        Effect.sync(createProviderMap),
        Effect.andThen((map) => Effect.sync(map.get(EndpointStore)))
      )
    )
  )
);

class HelloService {
  // TODO: think about how we want to return an effect from methods, to suspend the composed effects, allowing to merge over the event emitter queue and only start consuming when the layers are resolved and the map updated. This can create sreate some noticable lag, if resolving the layers takes long, so this might need to be optional through arguments?
  constructor(private store?: ReturnType<typeof createEndpointStore>) {}

  showCount() {
    console.log(this.store?.count.get(), 'from HelloService');
  }
}

export const EndpointPanelRuntime = createRuntimeContext(layer);
export const EndpointPanelProvider = createProviderContext(createProviderMap);
