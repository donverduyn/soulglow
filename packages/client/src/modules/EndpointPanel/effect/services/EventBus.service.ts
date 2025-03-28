import type { EventType } from 'common/utils/event';
import { BusService } from './Bus.service';

export class EventBusService extends BusService<EventType<unknown>> {}
