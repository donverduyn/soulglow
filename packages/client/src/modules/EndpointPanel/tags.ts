import {
  Context,
  type Effect,
  type PubSub,
  type SubscriptionRef,
} from 'effect';
import type { EntityStore } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import type { EndpointEntity } from './effect/entities/EndpointEntity';

const PREFIX = '@EndpointPanel';

export class Inbound extends Context.Tag(`${PREFIX}/InboundQueue`)<
  Inbound,
  PubSub.PubSub<EventType<unknown>>
>() {}

export class CountRef extends Context.Tag(`${PREFIX}/CountRef`)<
  CountRef,
  SubscriptionRef.SubscriptionRef<number>
>() {}

export class Foo extends Context.Tag(`${PREFIX}/Foo`)<Foo, string>() {}

export class Foobar extends Context.Tag(`${PREFIX}/Bar`)<
  Foobar,
  Effect.Effect<string, never, Foo>
>() {}

export class EndpointStore extends Context.Tag('@App/EndpointStore2')<
  EndpointStore,
  EntityStore<EndpointEntity>
>() {}
