// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Effect, Layer, type Context } from 'effect';
import * as Mobx from 'mobx';
import { EntityStoreCollection } from 'common/utils/collection';
import type { EventType } from 'common/utils/event';
import * as Tags from '../../tags';
import { EndpointEntity } from '../entities/Endpoint.entity';

const processEvents =
  (store: Context.Tag.Service<typeof Tags.EntityStore>['stores']['endpoint']) =>
  (event: EventType<unknown>) => {
    // console.log('EndpointStoreLayer', event, store.id);
    Mobx.runInAction(() => {
      // TODO: use XState to handle side effects.
      if (event.type === 'ADD_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        store.add(event.payload.endpoint);
      }
      if (event.type === 'UPDATE_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const endpoint = event.payload.endpoint as EndpointEntity;
        store.update(endpoint.id, endpoint);
      }
      if (event.type === 'REMOVE_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const id = event.payload.id as string;
        store.remove(id);
      }
      if (event.type === 'SELECT_ENDPOINT_REQUESTED') {
        // const id = event.payload.id as string;
        // store.selectById(id);
      }
    });
  };

export const entityStoreLayer = Layer.scoped(
  Tags.EntityStore,
  Effect.gen(function* () {
    const config = yield* Tags.InitializerRef;
    const collection = new EntityStoreCollection(Tags.entityMapping);
    // const consumer = pipe(
    //   Stream.fromPubSub(yield* Tags.InboundBusChannel),
    //   Stream.map(processEvents(collection.getStore('endpoint'))),
    //   Stream.runDrain,
    //   Effect.ensuring(
    //     Effect.gen(function* () {
    //       const runtimeId = yield* Ref.get(config).pipe(
    //         Effect.map(({ runtimeId }) => runtimeId),
    //         Effect.fork,
    //         Effect.andThen(Fiber.join)
    //       );
    //       yield* Console.log(
    //         '[EndpointPanelRuntime/EndpointStore] finalizing',
    //         runtimeId
    //       );
    //     })
    //   )
    // );

    // yield* Console.log('[EndpointPanelRuntime/EndpointStore] starting');
    // yield* Effect.forkScoped(consumer);
    return collection;
  })
);
