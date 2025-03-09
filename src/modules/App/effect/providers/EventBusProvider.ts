import type { EventType } from 'common/utils/event';
import { BusProviderBase } from './BusProviderBase';

export class EventBusProvider extends BusProviderBase<EventType<unknown>> {}
