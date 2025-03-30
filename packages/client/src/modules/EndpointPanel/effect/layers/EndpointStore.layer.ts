// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Effect, Layer, pipe, Stream, type Context, Console } from 'effect';
import * as Mobx from 'mobx';
import { EntityStore } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
// import { createEndpoint } from 'models/endpoint/Endpoint';
import * as Tags from '../../tags';
import { EndpointEntity } from '../entities/Endpoint.entity';

const processEvents =
  (store: Context.Tag.Service<typeof Tags.EndpointStore>) =>
  (event: EventType<unknown>) => {
    // console.log('EndpointStoreLayer', event, store.id);
    Mobx.runInAction(() => {
      // TODO: use XState to handle side effects.
      if (event.name === 'ADD_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        store.add(event.payload.endpoint);
      }
      if (event.name === 'UPDATE_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const endpoint = event.payload.endpoint as EndpointEntity;
        store.update(endpoint.id, (c) => (c.url = endpoint.url));
      }
      if (event.name === 'REMOVE_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const id = event.payload.id as string;
        store.remove(id);
      }
      if (event.name === 'SELECT_ENDPOINT_REQUESTED') {
        // const id = event.payload.id as string;
        // store.selectById(id);
      }
    });
  };

export const endpointStoreLayer = Layer.scoped(
  Tags.EndpointStore,
  Effect.gen(function* () {
    const store = new EntityStore<EndpointEntity>();
    const consumer = pipe(
      Stream.fromPubSub(yield* Tags.InboundBusChannel),
      Stream.map(processEvents(store)),
      Stream.runDrain,
      Effect.ensuring(Console.log('[EndpointStore] Stopped'))
    );

    yield* Effect.forkScoped(consumer);
    return store;
  })
);
