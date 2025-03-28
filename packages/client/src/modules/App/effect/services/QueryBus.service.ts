import type { QueryType } from 'common/utils/query';
import { BusService } from './Bus.service';

export class QueryBusService extends BusService<QueryType<unknown>> {}
