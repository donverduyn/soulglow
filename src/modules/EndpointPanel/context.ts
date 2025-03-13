import {
  Console,
  Effect,
  Layer,
  ManagedRuntime,
  pipe,
  PubSub,
  Queue,
  Ref,
  Stream,
  SubscriptionRef,
} from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { endpointStoreLayer } from './effect/layers/layers';
import * as Tags from './tags';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {
  const layerParent = Layer.succeed(Tags.Foo, 'foo');
  const runtimeParent = ManagedRuntime.make(layerParent);

  // TODO: think about the consequence of having Foo in Foobar Service type, maybe this is actually what we want, because we do provide our dependencies on the service level, not only at construction level.

  // TODO: try to use layer project etc, link the service of a tag
  Layer.service(Tags.Foo);

  const layerChild = pipe(
    Layer.succeed(
      Tags.Foobar,
      // Effect.gen(function* () {
      // const s = yield* Foo;
      Effect.andThen(Tags.Foo, (s) => s + 'bar')
      // })
    )
  );
  const runtimeChild = ManagedRuntime.make(layerChild);

  const program = Effect.gen(function* () {
    const effect = yield* Tags.Foobar;
    return effect;
  });

  const fromChild = Effect.runSync(Effect.provide(program, runtimeChild));
  const fromParent = Effect.provide(fromChild, runtimeParent);

  const result = Effect.runSync(fromParent);
  console.log(result); // prints foobar
}

export const EndpointPanelRuntime = pipe(
  endpointStoreLayer,
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const ref = yield* Tags.CountRef;
        yield* Stream.runDrain(ref.changes.pipe(Stream.tap(Console.log)));
      }).pipe(Effect.forkScoped)
    )
  ),
  Layer.provide(
    Layer.scopedDiscard(
      Effect.gen(function* () {
        const count = yield* Tags.CountRef;
        const inbound = yield* Tags.Inbound;
        const dequeue = yield* PubSub.subscribe(inbound);

        while (true) {
          const item = yield* Queue.take(dequeue);
          yield* Ref.update(count, (n) => n + 1);
          yield* Console.log('[EndpointPanel/InboundQueue]', item);
        }
      }).pipe(Effect.forkScoped)
    )
  ),
  Layer.provideMerge(
    Layer.effect(Tags.Inbound, PubSub.unbounded<EventType<unknown>>())
  ),
  Layer.provideMerge(Layer.effect(Tags.CountRef, SubscriptionRef.make(0))),
  createRuntimeContext
);

// TODO: each runtime, takes an optional configuration. Based on the shared property, before the runtime is created we check if there is already a runtime available based on the component name and required id as key. A map is used outside of react, to store the runtimes. The property postUnmountTTL is used to determine how long the runtime waits before it is disposed and removed from the map. Whenever a component remounts, it checks if there is a runtime available in the map, if so it uses that runtime, otherwise it creates a new one. This also stops the postUnmountTTL timer.

// TODO: instead of using events associated with an entity defined per entity and imported by the component from there, instead every module defines its own events in an events.ts file and the component imports the events from there.

// TODO: The repositories are created in the root runtime using a utility, but the repositories don't know upfront to which messages they have to listen. instead of hardcoding the messages in the repository based on which entity they are working with, we can provide the messages to which it should listen dynamically, OR we keep importing the events from the entity and publish those directly from the runtime. This makes it easier to track usage of the events, because now all usages of the event is only one click away.

// TODO: when the component mounts, we initially set the initializerRef subscription ref, such that it contains all the necessary dependencies for the runtime to run. This means usually the component/entity id as well as the publish functions of the root runtime (query, command, event) pubsubs. We have to be careful to not update the ref on every render.

// TODO: instead of publishing to the root, we want to publish directly to the runtime and use the publish functions of the root in the initializerRef, so it can be used on demand inside the runtime, for read/event operations or command/event operations. Every runtime has a command and query pubsub, which are injected into the component as well as an event pubsub to communicate local events. This avoids the situation where we need to stub the root runtime, and instead can just mock some of the messages on the root event bus.

// TODO: runtimes can publish to the root command, query and event bus, when needed. this is the case when we need to query data from a repository. in this case we can just have a stream that publishes every message received inside the runtime directly onto the root pubsub.

// TODO: the other way around, we have an InboundEvent pubsub that receives all events from the root event pubsub. In a sense we send all the queries and commands to the root and the root sends all the events down to the runtimes. Events are never controlling the behavior, but usually part of a request/response cycle, where the response is a new event that is published on the event bus.

// TODO: repositories don't have methods, because we want to avoid any other dependencies than the publish functions. This means that we should think about wether we want to provide extra data in the query or command messages, in order to control whatever the repository publishes on the event bus. This already was the plan because we wanted to use identifiers, but we could go one step further and have a small api to control whatever the repository publishes on the event bus. The payload of the query/command messages should be something like : { id: string, type: string, fields: string[], eventType: string }. This way, runtimes can specify which eventType is associated with the query/command and the repository can publish the event with the same eventType (defined in the events.ts file of the module).

// TODO: repositories are responsible for fetching data as well as requesting changes or adding entities. This means that every repository should listen for an event to fetch, an event to update, an event to delete and an event to add. There is also a message type to query the ids of entities (list) with pagination (which automatically trigger fetches). This way the data is already loading before being requested by the individual read queries. For this reason list queries also take fields properties. List events are defined by the modules and their event types are provided in the query payload. For the individual queries, they take into account the TTL/timestamp on entity records in the cache in order to refetch. The repository is responsible for batching reads. Repositories can optionally have protocol layer injected to handle the communication with the backend. In this case it would be the responsibility of the protocol layer to batch the reads and writes. The protocol layer could be dynamically provided based on environment variables.

// TODO: every runtime manages either reactive entity stores or a single reactive entity. These are updated on every read, update or add event (in case of an entity store). Some runtimes are only representative for a single entity, so in this case we use observable.box and assign it to a layer directly through an api. Otherwise we use the existing entity store. When a runtime uses an entity store, that usually means that it contains the entities for a list, such that the list components themselves don't need a runtime. In this case the module provides queries/commands to send through the runtime at the parent component, by providing a publish function or something that consumes it through props. This can be more performant in case of large lists, because even with virtual scroll, runtimes would be created and retained for every item in the list, often with no real benefit.

// TODO: repositories should add a flag to entities that are optimisticly added or updated. This way we can delay a response event for a read until the backend has confirmed the change. This way we can guarantee strict correctness of the cached data. We can consider adding a property to queries/commands that specify wether the response should be strict or not.
