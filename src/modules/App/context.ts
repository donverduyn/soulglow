import { pipe, Layer, Context, PubSub, Effect, Stream, Fiber } from 'effect';
import * as Mobx from 'mobx';
import { createRuntimeContext } from 'common/utils/context';
import { browserLogger, getRunFork } from 'common/utils/effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import {
  createEndpoint,
  type Endpoint,
} from 'modules/App/models/endpoint/endpoint';
import { EventBusService } from 'modules/App/services/EventBusService';
import AppTokens from './tokens';

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export const AppRuntime = createRuntimeContext(layer());

const processEvents =
  (store: Context.Tag.Service<typeof AppTokens.EndpointStore>) =>
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

function layer() {
  return pipe(
    Layer.scoped(
      AppTokens.EndpointStore,
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
            yield* Effect.andThen(AppTokens.EventBus, (bus) => bus.bus)
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
        AppTokens.EventBus,
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
    Layer.merge(browserLogger)
  );
}

// const machine = createMachine({
//   id: 'endpoint',
//   initial: 'idle',
//   states: {
//     idle: {
//       on: {
//         ADD_ENDPOINT_REQUESTED: {
//           actions: emit({ type: 'ADD_ENDPOINT_REQUESTED 2' }),
//         },
//         UPDATE_ENDPOINT_REQUESTED: {
//           actions: emit({ type: 'UPDATE_ENDPOINT_REQUESTED 2' }),
//         },
//       },
//     },
//   },
// });

// const actor = createActor(machine);
// actor.start();
// actor.send({ type: 'ADD_ENDPOINT_REQUESTED' });
