import type { EventType } from 'common/utils/event';
import { BusService } from './Bus.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ResponseBusService extends BusService<EventType<any>> {}
