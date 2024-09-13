import {
  Context,
  Effect,
  Layer,
  pipe,
  Stream,
  Fiber,
  PubSub,
  Runtime,
  Queue,
  Take,
} from 'effect';
import type { Endpoint } from 'common/models/endpoint/endpoint';
import { createRuntimeContext } from 'common/utils/context';
import { createEntityStore, withSelected } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import { createEndpoint } from './models/Endpoint';
import { HelloService } from './services/HelloService';
import { WorldService } from './services/WorldService';

const PREFIX = '@EndpointPanel';

export class EndpointStore extends Context.Tag(`${PREFIX}/EndpointStore`)<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class EndpointCore extends Context.Tag(`${PREFIX}/EndpointCore`)<
  EndpointCore,
  PubSub.PubSub<Take.Take<string>>
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
  Stream.Stream<PointerEvent>
>() {}

export class InboundQueue extends Context.Tag(`${PREFIX}/InboundQueue`)<
  InboundQueue,
  Queue.Queue<EventType<unknown>>
>() {}

export const EndpointPanelRuntime = createRuntimeContext(layer);
const createEndpointStore = pipe(createEntityStore<Endpoint>, withSelected);

export function layer() {
  return pipe(
    Layer.scoped(
      EndpointStore,
      Effect.gen(function* () {
        const queue = yield* InboundQueue;
        const runFork = yield* Effect.runtime().pipe(
          Effect.andThen(Runtime.runFork)
        );

        const consumer = pipe(
          Queue.take(queue),
          Effect.andThen((event) => {
            // TODO: use xstate to handle side effects
            // TODO: think about how we can batch updates to the store with mobx, when multiple events are received in quick succession. This happens for example when we events are replayed from the bus on remount.
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
          }),
          Effect.forever
          // Effect.provide(Logger.logFmt),
          // Effect.annotateLogs({ key1: "value1", key2: "value2" }),
        );

        // TODO: consider abstracting away the setup and teardown of async fibers
        const eventStreamFiber = runFork(consumer);
        yield* Effect.addFinalizer(() => Fiber.interrupt(eventStreamFiber));

        const store = createEndpointStore();
        const endpoint = createEndpoint();

        // TODO: consider using persistent storage instead of recreating the first endpoint every time (because it will overwrite the previous one). we should persist both the entitystore and the actor on unmount.
        store.add(endpoint);
        store.selectById(endpoint.id);
        return store;
      })
    ),
    Layer.provideMerge(
      Layer.effect(InboundQueue, Queue.unbounded<EventType<unknown>>())
    )
    // Layer.provide(
    //   Layer.succeed(
    //     Foo,
    //     Stream.fromEventListener<PointerEvent>(window, 'click')
    //   )
    // ),
    // Layer.provide(
    //   Layer.scoped(
    //     EndpointCore,
    //     pipe(
    //       Stream.asyncPush<string>(
    //         (emit) =>
    //           Effect.acquireRelease(
    //             Effect.sync(() => setInterval(() => emit.single(`🟢`), 1000)),
    //             (handle) => Effect.sync(() => clearInterval(handle))
    //           ),
    //         { bufferSize: 'unbounded' }
    //       ),
    //       // TODO: think about an alternative to asyncPush, because it doesn't make sense to go from push to pull and back to push
    //       Stream.toPubSub({ capacity: 'unbounded' })
    //     )
    //   )
    // )
    // Layer.provide(
    //   Layer.scopedDiscard(Effect.addFinalizer(() => Console.log('cleanup')))
    // )
  );
}
