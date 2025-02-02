import { Context, type Effect, type Queue } from 'effect';
import type { EntityStore } from 'common/utils/entity';
import type { EventType } from 'common/utils/event';
import type { EndpointEntity } from './effect/entities/EndpointEntity';

const PREFIX = '@EndpointPanel';

export class InboundQueue extends Context.Tag(`${PREFIX}/InboundQueue`)<
  InboundQueue,
  Queue.Queue<EventType<unknown>>
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
