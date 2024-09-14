import {
  Context,
  Effect,
  Layer,
  pipe,
  Stream,
  Fiber,
  Runtime,
  Queue,
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

export class Actor extends Context.Tag(`${PREFIX}/EndpointCore`)<
  Actor,
  // PubSub.PubSub<Take.Take<string>>
  unknown
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

        const store = createEndpointStore();
        const consumer = pipe(
          Queue.take(queue),
          Effect.andThen((event) => {
            // TODO: use xstate to handle side effects
            // TODO: think about how we can batch updates to the store with mobx, when multiple events are received in quick succession. This happens for example when we events are replayed from the bus on remount. It seems that this is not a problem with fast refresh, but only if there are visible changes during the replay.
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
        );

        // TODO: consider abstracting away the setup and teardown of async fibers
        const eventStreamFiber = runFork(consumer);
        yield* Effect.addFinalizer(() => Fiber.interrupt(eventStreamFiber));

        // TODO: consider using persistent storage instead of recreating the first endpoint every time (because it will overwrite the previous one). we should persist both the entitystore and the actor on unmount.
        const endpoint = createEndpoint();
        store.add(endpoint);
        store.selectById(endpoint.id);
        return store;
      })
    ),
    Layer.provideMerge(
      Layer.scoped(
        Actor,
        Effect.gen(function* () {
          // const queue = yield* InboundQueue;
          // const runFork = yield* Effect.runtime().pipe(
          //   Effect.andThen(Runtime.runFork)
          // );
          // const consumer = pipe(
          //   Queue.take(queue),
          //   Effect.andThen(Console.log),
          //   Effect.forever
          // );
          // const eventStreamFiber = runFork(consumer);
          // yield* Effect.addFinalizer(() => Fiber.interrupt(eventStreamFiber));
          // const dequeue = yield* Queue.take(queue);
          // console.log(dequeue);
          // yield* Effect.sleep(1000);
          // const stream = Stream.asyncPush<string>(
          //   (emit) =>
          //     Effect.acquireRelease(
          //       pipe(
          //         Effect.sync(() => createActor(machine)),
          //         Effect.map((actor) => {
          //           actor.start();
          //           const sub = actor.on('*', (emitted) => {
          //             emit.single(emitted.type);
          //           });
          //           return [actor, sub] as const;
          //         })
          //       ),
          //       ([actor, sub]) =>
          //         Effect.sync(() => {
          //           sub.unsubscribe();
          //           actor.stop();
          //         })
          //     ),
          //   { bufferSize: 'unbounded' }
          // );
          // return stream;
        }) //.pipe(Stream.toPubSub({ capacity: 'unbounded' }))
      )
    ),
    Layer.provideMerge(
      Layer.effect(InboundQueue, Queue.unbounded<EventType<unknown>>())
    )
    // Layer.provide(
    //   Layer.scopedDiscard(Effect.addFinalizer(() => Console.log('cleanup')))
    // )
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
