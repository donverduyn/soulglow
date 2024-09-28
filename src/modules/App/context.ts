import { pipe, Layer, Context, PubSub, Effect, Stream, Fiber } from 'effect';
import * as Mobx from 'mobx';
import { createRuntimeContext } from 'common/utils/context';
import { browserLogger, getRunFork } from 'common/utils/effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import { createEndpoint, type Endpoint } from './models/endpoint/endpoint';
import { EventBusService } from './services/EventBusService';
import * as AppTags from './tags';

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

const processEvents =
  (store: Context.Tag.Service<typeof AppTags.EndpointStore>) =>
  (event: EventType<unknown>) => {
    Mobx.runInAction(() => {
      // TODO: use XState to handle side effects.
      if (event.name === 'ADD_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        store.add(event.payload.endpoint);
      }
      if (event.name === 'UPDATE_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const endpoint = event.payload.endpoint as Endpoint;
        store.update(endpoint.id, (c) => (c.url = endpoint.url));
      }
      if (event.name === 'REMOVE_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const id = event.payload.id as string;
        store.remove(id);
      }
      if (event.name === 'SELECT_ENDPOINT_REQUESTED') {
        // @ts-expect-error event.payload is not typed
        const id = event.payload.id as string;
        store.selectById(id);
      }
    });
  };

export const AppRuntime = pipe(
  Layer.scoped(
    AppTags.EndpointStore,
    Effect.gen(function* () {
      const runFork = yield* getRunFork;

      const createEndpointStore = pipe(
        createEntityStore<Endpoint>,
        withSelected
      );
      const store = createEndpointStore();
      const consumer = pipe(
        // TODO: bus should be provided through a layer
        Stream.fromPubSub(
          yield* Effect.andThen(AppTags.EventBus, (bus) => bus.bus)
        ),
        Stream.tap(Effect.logInfo),
        Stream.map(processEvents(store)),
        Stream.runDrain
      );

      const consumerFiber = runFork(consumer);
      yield* Effect.addFinalizer(() => Fiber.interrupt(consumerFiber));

      // TODO: consider using persistent storage instead of recreating the first endpoint every time. we should persist both the entitystore and the actor on unmount. Also consider if we want to apply these changes through events, as this would solve the problem before anything is persisted.

      const endpoint = createEndpoint();
      store.add(endpoint);
      store.selectById(endpoint.id);
      return store;
    })
  ),
  Layer.provideMerge(
    Layer.effect(
      AppTags.EventBus,
      pipe(
        PubSub.unbounded<EventType<unknown>>({
          replay: Number.POSITIVE_INFINITY,
        }),
        Effect.andThen((bus) => {
          return new EventBusService(bus);
        })
      )
    )
  ),
  Layer.merge(browserLogger),
  createRuntimeContext
);
