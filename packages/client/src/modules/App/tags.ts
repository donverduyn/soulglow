import { Context, type PubSub } from 'effect';
import type { CommandType } from 'common/utils/command';
import type { EventType } from 'common/utils/event';
import type { QueryType } from 'common/utils/query';
import type { CommandBusProvider } from './effect/providers/CommandBusProvider';
import type { EventBusProvider } from './effect/providers/EventBusProvider';
import type { QueryBusProvider } from './effect/providers/QueryBusProvider';

export class EventBus extends Context.Tag('@App/EventBus')<
  EventBus,
  EventBusProvider
>() {}

export class EventBusChannel extends Context.Tag('@App/EventBusChannel')<
  EventBusChannel,
  PubSub.PubSub<EventType<unknown>>
>() {}

export class QueryBus extends Context.Tag('@App/QueryBus')<
  QueryBus,
  QueryBusProvider
>() {}

export class QueryBusChannel extends Context.Tag('@App/QueryBusChannel')<
  QueryBusChannel,
  PubSub.PubSub<QueryType<unknown>>
>() {}

export class CommandBus extends Context.Tag('@App/CommandBus')<
  CommandBus,
  CommandBusProvider
>() {}

export class CommandBusChannel extends Context.Tag('@App/CommandBusChannel')<
  CommandBusChannel,
  PubSub.PubSub<CommandType<unknown>>
>() {}
