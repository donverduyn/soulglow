import type { EventType } from 'common/utils/event';
import { BusService } from './Bus.service';

export class InboundBusService extends BusService<EventType<unknown>> {}
