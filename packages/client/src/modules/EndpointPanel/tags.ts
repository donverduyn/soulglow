import { Context, type PubSub, type SubscriptionRef } from 'effect';
import type { RuntimeFiber } from 'effect/Fiber';
import type { CommandType } from 'common/utils/command';
import type { EntityStore } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import type { QueryType } from 'common/utils/query';
import type { EndpointEntity } from './effect/entities/Endpoint.entity';
import type { EventBusService } from './effect/services/EventBus.service';
import type { InboundBusService } from './effect/services/InboundBus.service';

const NAME = '@EndpointPanel';

export type InitializerState = {
  componentId: string;
  initialized: boolean;
  publishCommand: (event: CommandType<unknown>) => Promise<boolean>;
  publishQuery: (event: QueryType<unknown>) => Promise<boolean>;
  register: (
    fn: (event: EventType<unknown>) => RuntimeFiber<boolean | string>
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

type Nullable<T> = {
  [K in keyof T]: T[K] extends object ? Nullable<T[K]> | null : T[K] | null;
};

export class InitializerRef extends Context.Tag(`${NAME}/InitializerRef`)<
  InitializerRef,
  SubscriptionRef.SubscriptionRef<InitializerState | Nullable<InitializerState>>
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

export class EndpointStore extends Context.Tag(`${NAME}/EndpointStore`)<
  EndpointStore,
  EntityStore<EndpointEntity>
>() {}

export class EventBus extends Context.Tag(`${NAME}/EventBus`)<
  EventBus,
  EventBusService
>() {}

export class EventBusChannel extends Context.Tag(`${NAME}/EventBusChannel`)<
  EventBusChannel,
  PubSub.PubSub<EventType<unknown>>
>() {}
