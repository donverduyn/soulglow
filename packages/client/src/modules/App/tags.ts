import { Context, type PubSub } from 'effect';
import type { CommandType } from 'common/utils/command';
import type { EventType } from 'common/utils/event';
import type { QueryType } from 'common/utils/query';
import type { CommandBusService } from './effect/services/CommandBus.service';
import type { ResponseBusService } from './effect/services/EventBus.service';
import type { QueryBusService } from './effect/services/QueryBus.service';

export class QueryBus extends Context.Tag('@App/QueryBus')<
  QueryBus,
  QueryBusService
>() {}

export class QueryBusChannel extends Context.Tag('@App/QueryBusChannel')<
  QueryBusChannel,
  PubSub.PubSub<QueryType<unknown>>
>() {}

export class CommandBus extends Context.Tag('@App/CommandBus')<
  CommandBus,
  CommandBusService
>() {}

export class CommandBusChannel extends Context.Tag('@App/CommandBusChannel')<
  CommandBusChannel,
  PubSub.PubSub<CommandType<unknown>>
>() {}

export class ResponseBus extends Context.Tag('@App/EventBus')<
  ResponseBus,
  ResponseBusService
>() {}

export class ResponseBusChannel extends Context.Tag('@App/EventBusChannel')<
  ResponseBusChannel,
  PubSub.PubSub<EventType<unknown>>
>() {}
