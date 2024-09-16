import {
  Context,
  Effect,
  Layer,
  pipe,
  Stream as S,
  Fiber,
  Queue,
} from 'effect';
import { runInAction } from 'mobx';
import type { Endpoint } from 'common/models/endpoint/endpoint';
import { createRuntimeContext } from 'common/utils/context';
import { getRunFork, groupDebounce } from 'common/utils/effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import { createEndpoint } from './models/Endpoint';

// attach any additional operators to the Stream object
const Stream = Object.assign(S, { groupDebounce });
const PREFIX = '@EndpointPanel';

export class EndpointStore extends Context.Tag(`${PREFIX}/EndpointStore`)<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class InboundQueue extends Context.Tag(`${PREFIX}/InboundQueue`)<
  InboundQueue,
  Queue.Queue<EventType<unknown>>
>() {}

export const EndpointPanelRuntime = createRuntimeContext(layer());
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
          Stream.fromQueue(yield* InboundQueue),
          Stream.groupDebounce(0),
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
      Layer.effect(InboundQueue, Queue.unbounded<EventType<unknown>>())
    )
  );
}
