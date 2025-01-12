import { Context } from 'effect';
import type { Simplify } from 'type-fest';
import type { Crudable, Selectable } from 'common/utils/entity';
import type { Endpoint } from 'models/endpoint/model';
import type { EventBusService } from './services/EventBusService';

class EventBus extends Context.Tag('@App/EventBus')<
  EventBus,
  EventBusService
>() {}

class EndpointStore extends Context.Tag('@App/EndpointStore2')<
  EndpointStore,
  Simplify<Crudable<Endpoint> & Selectable<Endpoint>>
>() {}

export { EndpointStore, EventBus };
