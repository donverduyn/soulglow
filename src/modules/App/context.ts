import { pipe, Layer, Context, PubSub, Effect, Stream, Fiber } from 'effect';
import { runInAction } from 'mobx';
import { createRuntimeContext } from 'common/utils/context';
import { getRunFork, groupDebounce } from 'common/utils/effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import {
  createEndpoint,
  type Endpoint,
} from 'modules/App/models/endpoint/endpoint';
import { EventBusService } from 'modules/App/services/EventBusService';

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

// TODO: namespace the context tags
export class EventBus extends Context.Tag('@App/EventBus')<
  EventBus,
  EventBusService
>() {}

export class ReplayPubSub extends Context.Tag('@App/EventBus')<
  EventBus,
  PubSub.PubSub<EventType<unknown>>
>() {}

export class EndpointStore extends Context.Tag('@App/EndpointStore2')<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export const AppRuntime = createRuntimeContext(layer());
const createEndpointStore = pipe(createEntityStore<Endpoint>, withSelected);

const processEvents =
  (store: Context.Tag.Service<EndpointStore>) =>
  (events: EventType<unknown>[]) => {
    runInAction(() => {
      events.forEach((event) => {
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
      });
    });
  };

function layer() {
  return pipe(
    Layer.scoped(
      EndpointStore,
      Effect.gen(function* () {
        const runFork = yield* getRunFork;

        const store = createEndpointStore();
        const consumer = pipe(
          Stream.fromPubSub(yield* Effect.andThen(EventBus, (bus) => bus.bus)),
          groupDebounce(0),
          // Stream.tap(Effect.logInfo),
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
        EventBus,
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
    Layer.provideMerge(
      Layer.effect(
        ReplayPubSub,
        pipe(
          PubSub.unbounded<EventType<unknown>>({
            replay: Number.POSITIVE_INFINITY,
          })
        )
      )
    )
  );
}

// TODO: consider we want to keep actors running at the root level, so they outlive the components that use them. By not replaying the root event bus, but replaying the emitted events from the actors instead, we avoid replayed events from affecting the system. If we design our actors around entities, or models, they are no longer bound to the usage in specific components and the events they emit, would be replayed on component remounts. In this case component bound runtimes, can apply side effects to entity stores. This way every component replicates whatever entity stores it needs to calculate its computed values and the state becomes eventually consistent. We have to think about where to store the implementations of the actors, as they are component agnostic. maybe src/system/actors

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
