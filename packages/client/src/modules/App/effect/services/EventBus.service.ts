import type { EventType } from 'common/utils/event';
import { BusService } from './Bus.service';

export class ResponseBusService extends BusService<EventType<unknown>> {}
