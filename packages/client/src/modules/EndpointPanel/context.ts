import { Client, type AnyVariables } from '@urql/core';
import { fetchExchange } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
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
import { DocumentNode } from 'graphql';
import schema from '__generated/gql/introspection.urql.json';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { endpointStoreLayer } from './effect/layers/EndpointStoreLayer';
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
        yield* Stream.runDrain(
          ref.changes.pipe(
            Stream.tap((a) => Console.log('[EndpointPanelRuntime/CountRef]', a))
          )
        );
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

type QueryFactory = <
  TDocumentNode extends DocumentNode,
  TVariables extends AnyVariables,
  TResponse,
>(
  query: TDocumentNode,
  variables: TVariables
) => Promise<TResponse>;

const client = new Client({
  exchanges: [cacheExchange({ schema }), fetchExchange],
  fetchOptions: () => ({
    headers: {
      'X-Hasura-Admin-Secret': 'admin_secret',
    },
  }),
  url: 'http://localhost:8080/v1/graphql',
});

// Generic query factory function
const queryFactory: QueryFactory = async (query, variables) => {
  const result = await client.query(query, variables).toPromise();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result.data; // Automatically inferred as TResponse
};

// TODO: each runtime, takes an optional configuration. Based on the shared property, before the runtime is created we check if there is already a runtime available based on the component name and required id as key. A map is used outside of react, to store the runtimes. The property postUnmountTTL is used to determine how long the runtime waits before it is disposed and removed from the map. Whenever a component remounts, it checks if there is a runtime available in the map, if so it uses that runtime, otherwise it creates a new one. This also stops the postUnmountTTL timer.

// TODO: instead of using events associated with an entity defined per entity and imported by the component from there, instead every module defines its own events in an events.ts file and the component imports the events from there.

// TODO: The repositories are created in the root runtime using a utility, but the repositories don't know upfront to which messages they have to listen. instead of hardcoding the messages in the repository based on which entity they are working with, we can provide the messages to which it should listen dynamically, OR we keep importing the events from the entity and publish those directly from the runtime. This makes it easier to track usage of the events, because now all usages of the event is only one click away.

// TODO: when the component mounts, we initially set the initializerRef subscription ref, such that it contains all the necessary dependencies for the runtime to run. This means usually the component/entity id as well as the publish functions of the root runtime (query, command, event) pubsubs. We have to be careful to not update the ref on every render.

// TODO: instead of publishing to the root, we want to publish directly to the runtime and use the publish functions of the root in the initializerRef, so it can be used on demand inside the runtime, for read/event operations or command/event operations. Every runtime has a command and query pubsub, which are injected into the component as well as an event pubsub to communicate local events. This avoids the situation where we need to stub the root runtime, and instead can just mock some of the messages on the root event bus.

// TODO: runtimes can publish to the root command, query and event bus, when needed. this is the case when we need to query data from a repository. in this case we can just have a stream that publishes every message received inside the runtime directly onto the root pubsub.

// TODO: the other way around, we have an InboundEvent pubsub that receives all events from the root event pubsub. In a sense we send all the queries and commands to the root and the root sends all the events down to the runtimes. Events are never controlling the behavior, but usually part of a request/response cycle, where the response is a new event that is published on the event bus.

// TODO: repositories don't have methods, because we want to avoid any other dependencies than the publish functions. This means that we should think about wether we want to provide extra data in the query or command messages, in order to control whatever the repository publishes on the event bus. This already was the plan because we wanted to use identifiers, but we could go one step further and have a small api to control whatever the repository publishes on the event bus. The payload of the query/command messages should be something like : { id: string, type: string, fields: string[], eventType: string }. This way, runtimes can specify which eventType is associated with the query/command and the repository can publish the event with the same eventType (defined in the events.ts file of the module).

// TODO: repositories are responsible for fetching data as well as requesting changes or adding entities. This means that every repository should listen for an event to fetch, an event to update, an event to delete and an event to add. There is also a message type to query the ids of entities (list) with pagination (which automatically trigger fetches). This way the data is already loading before being requested by the individual read queries. For this reason list queries also take fields properties. List events are defined by the modules and their event types are provided in the query payload. For the individual queries, they take into account the TTL/timestamp on entity records in the cache in order to refetch. The repository is responsible for batching reads. Repositories can optionally have protocol layer injected to handle the communication with the backend. In this case it would be the responsibility of the protocol layer to batch the reads and writes. The protocol layer could be dynamically provided based on environment variables.

// TODO: every runtime manages either reactive entity stores, a single reactive entity, or a subscritionRef with useRuntimeFn, to call setState in the provided callback on changes. These are updated on every read, update or add event (in case of an entity store). Some runtimes are only representative for a single entity, so in this case we use observable.box and assign it to a layer directly through an api. Otherwise we use the existing entity store. When a runtime uses an entity store, that usually means that it contains the entities for a list, such that the list components themselves don't need a runtime. In this case the module provides queries/commands to send through the runtime at the parent component, by providing a publish function or something that consumes it through props. This can be more performant in case of large lists, because even with virtual scroll, runtimes would be created and retained for every item in the list, often with no real benefit. We might want to have a super light weight alternative here so we can still use the map for monitoring components, but not have the overhead of a full runtime.

// TODO: repositories should add a flag to entities that are optimisticly added or updated. This way we can delay a response event for a read until the backend has confirmed the change. This way we can guarantee strict correctness of the cached data. We can consider adding a property to queries/commands that specify wether the response should be strict or not.

// TODO: at the component level, we publish to the user event pubsub, which is part of the component runtime. At the root the event pubsub is used as a response channel of the repository layer, but in the same way the user event pubsub can be seen as a response channel of the ui.

// TODO: every query and command can both result in a success and error response. The error response is also used to manage rollbacks, such as reverting optimistic changes in the view model. The repositories are responsible for reverting optimistic changes in the cache layer in this case.

// TODO: in order to improve strict correctness, we want to take into account the round trip time of the backend, such that when repositories receive a query, they can assess weather the data is still fresh, if that data is relied upon for follow-up commands. By waiting at least the round trip time since the message was received before actually reading the value, we eliminate the possibility that inflight changes were missed, resulting in a breach of strict correctness. We might want to use STM on the backend to ensure that everytime we read shared data, we avoid early reads and subsequent writes.

// TODO: repositories are responsible for subscribing to websocket events, when the protocol layer is ws, or gql subscriptions when gql. This way the repository not only supports request/response, but also push events, that can update both the cache and the view models relying on the data being updated.

// TODO: instead of having multiple repositories at the root, consider having a single repository that converts all queries and commands into gql statements, provides them to urql and returns the result into a response event its payload. Then on the component level we use a single reactive entity store that abstracts away the normalization based on the provided payload (using __type property). This can be done by holding a map of entity stores, where the __type property is used for the key to interact with each speficic entity store.

// TODO: think about urql how we can use the implementation of the react integration for our own implementation, to subscribe to changes on queries. Think about how we can relate our queries/commands to behavior in urql cache updates. queries might need a live flag, so that we can store them in a map and use the provided ids to trigger updated events, this way we can have an obsvervable like setup with multiple request/response cycles.

// TODO: in order to support external changes from triggering updates to live queries, we can rely on urql it's update mechanism, but we still have to relay the updates to our own live queries.

// TODO: find a way to fetch the schema from hasura, by having a yarn dev script that runs both the the hasura server as well as the console, where we hook into the console migration event, that is automatically triggered on changes to the underlying db. use graphqurl for fetching the schema by using http://hasura:8080 from inside the dev container. Use graphql-codegen, with urql-introspection based on that schema file. the schema file could be in src/__generated ???

// TODO: move all things backend related to packages/api and move all things client related to packages/client. use yarn workspaces or pnpm at some point? Maybe also go to nx?

// TODO: think about if we can subscribe to a pubsub but for being only interested in certain messages, such that we don't receive the rest at all, where effect-TS groups subscribers into which topics/messages they are interested in.

// TODO: use msw mock handlers generated from graphql codegen and export them from the context file, such that they are tree shakable and importable from stories.ts files. By using response factories, we can create mocks for both the msw handlers as well as the messages for the mocked pubsub when we unit test the runtime.

// TODO: make sure we run the migrations and seeds against hasura when the dev container is created.

// TODO: instead of publishing messages on the query bus and command bus, instead we publish gql queries and mutations directly. the reason is that if we define gql`` in the runtime, they can be statically analyzed in codegen as well as having auto completion and type safety ootb. it also simplifies the architecture, because we no longer have to convert messages to gql. we can provide request id as a variable and put it on to the response in the event/response message. we can borrow the signature of the useQuery useMutation hooks for our query/command bus, but instead make sure we have a single object, with the gql ast, the variables and anything else that the response depends on, or for monitoring purposes.

// TODO: unit testing the runtime is not about checking the response on the event pubsub. its about seeing what goes out at the query bus command bus based on what goes in on the user event bus

// TODO: we want to export msw handlers from the runtime files instead  of importing them straight from __generated/gql, because the queries defined in the runtime file are the source of truth here. We should also think about how we want to seperate codegen for mocks and allow list from the schema and mock data generation. It would make sense to import from the runtime generation file, from the runtime file to configure the msw handlers. Decide where we want to start the codegen on dev container creation as well as on dev / storybook ? and think about wether we can get ts errors if we are about running vitest from vscode against storybook

// TODO: if we move away from portable stories, we no longer have to worry about outdated msw mocks from codegen, because if it runs through storybook, it will probably use the vite config. We might want to checkout if this is also true for portable stories in node.

// TODO: think about which components need to be SSR renderable, maybe all of the ui components, add *.ssr.test.ts files and run them in node

// TODO: think about play functions as a way to prevent the base state from having to be reproduced in integration tests. We can also consider composing play functions to add different parts of interactions to build up a baseline for each story, so the stories can be imported as portable stories and visualize each part of the step, we could do this by defining the play functions separately from the stories.
