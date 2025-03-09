import type { CommandType } from 'common/utils/command';
import { BusProviderBase } from './BusProviderBase';

export class CommandBusProvider extends BusProviderBase<CommandType<unknown>> {}
