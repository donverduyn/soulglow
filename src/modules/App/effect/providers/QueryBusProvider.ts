import type { QueryType } from 'common/utils/query';
import { BusProviderBase } from './BusProviderBase';

export class QueryBusProvider extends BusProviderBase<QueryType<unknown>> {}
