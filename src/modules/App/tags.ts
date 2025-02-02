import { Context, type PubSub } from 'effect';
import type { EventType } from 'common/utils/event';
import type { EventBusProvider } from './effect/providers/EventBusProvider';

export class EventBus extends Context.Tag('@App/EventBus')<
  EventBus,
  EventBusProvider
>() {}

export class EventBusPubSub extends Context.Tag('@App/EventBusPubSub')<
  EventBusPubSub,
  PubSub.PubSub<EventType<unknown>>
>() {}
