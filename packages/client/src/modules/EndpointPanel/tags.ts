import { Context, type PubSub, type SubscriptionRef, Effect } from 'effect';
import type {
  EntityMapping,
  EntityStoreCollection,
} from 'common/utils/collection';
import type { EventType } from 'common/utils/event';
import { EndpointEntity } from './effect/entities/Endpoint.entity';
import type { EventBusService } from './effect/services/EventBus.service';
import type { InboundBusService } from './effect/services/InboundBus.service';
import type { InitializerService } from './effect/services/Initializer.service';

const NAME = '@EndpointPanel';

export type InitializerState = {
  componentId: string;
  initialized: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publishCommand: (event: EventType<any>) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publishQuery: (event: EventType<any>) => Promise<boolean>;
  register: (
    topic: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (event: EventType<any>) => Effect.Effect<any, any, any>
  ) => Promise<() => Promise<boolean>>;
  runtimeId: string;
};

const defaultInitializerState: Nullable<InitializerState> = {
  componentId: null,
  initialized: false,
  publishCommand: null,
  publishQuery: null,
  register: null,
  runtimeId: null,
};

export const createInitializerState = (
  overrides?: Partial<InitializerState>
): Nullable<InitializerState> => {
  return Object.assign({}, defaultInitializerState, overrides);
};

export type Nullable<T> = {
  [K in keyof T]: T[K] extends object
    ? Nullable<T[K]> | null
    : T[K] | null | undefined;
};

export class InitializerRef extends Context.Tag(`${NAME}/InitializerRef`)<
  InitializerRef,
  SubscriptionRef.SubscriptionRef<InitializerState | Nullable<InitializerState>>
>() {}

export class Initializer extends Context.Tag(`${NAME}/Initializer`)<
  Initializer,
  InitializerService
>() {}

export class InboundBus extends Context.Tag(`${NAME}/InboundBus`)<
  InboundBus,
  InboundBusService
>() {}

export class InboundBusChannel extends Context.Tag(`${NAME}/InboundBusChannel`)<
  InboundBusChannel,
  PubSub.PubSub<EventType<unknown>>
>() {}

// export class CountRef extends Context.Tag(`${PREFIX}/CountRef`)<
//   CountRef,
//   SubscriptionRef.SubscriptionRef<number>
// >() {}

// export class Foo extends Context.Tag(`${PREFIX}/Foo`)<Foo, string>() {}

// export class Foobar extends Context.Tag(`${PREFIX}/Bar`)<
//   Foobar,
//   Effect.Effect<string, never, Foo>
// >() {}

export const entityMapping = {
  endpoint: EndpointEntity,
} satisfies EntityMapping<'EndpointPanel'>;

export class EntityStore extends Context.Tag(`${NAME}/EntityStore`)<
  EntityStore,
  EntityStoreCollection<typeof entityMapping>
>() {}

export class EventBus extends Context.Tag(`${NAME}/EventBus`)<
  EventBus,
  EventBusService
>() {}

export class EventBusChannel extends Context.Tag(`${NAME}/EventBusChannel`)<
  EventBusChannel,
  PubSub.PubSub<EventType<unknown>>
>() {}
