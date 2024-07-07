import { Context, Effect, flow, Layer, pipe } from 'effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createTypedMap, withKey as register } from 'common/utils/map';
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
  // withFiltered
);

const createHelloService = (store: ReturnType<typeof createEndpointStore>) =>
  new HelloService(store);

// map tokens to optimistic factory providers
const createProviderMap = pipe(
  createTypedMap,
  register(EndpointStore, createEndpointStore),
  register(Hello, createHelloService)
);

// TODO: find a way to lazily create the provider map during layer creation
const providerFactories = createProviderMap();

const layer = pipe(
  Layer.effect(
    Hello,
    pipe(EndpointStore, Effect.andThen(flow(providerFactories.get(Hello))))
  ),
  Layer.provideMerge(
    Layer.effect(
      EndpointStore,
      Effect.sync(() => {
        console.log('store created from effect');
        return Object.assign(createEndpointStore(), { id: 'real' });
      })
    )
  )
);

class HelloService {
  constructor(private store: ReturnType<typeof createEndpointStore>) {}

  showId() {
    // @ts-expect-error id is not a property of the store
    console.log(this.store.id);
  }
}

export const EndpointPanelRuntime = createRuntimeContext(layer);

export const EndpointPanelProvider = createProviderContext(createProviderMap);
