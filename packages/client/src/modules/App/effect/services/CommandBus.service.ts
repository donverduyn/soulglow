import type { CommandType } from 'common/utils/command';
import { BusService } from './Bus.service';

export class CommandBusService extends BusService<CommandType<unknown>> {}
