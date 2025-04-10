import {
  EndpointSetInput,
  type EndpointInsertInput,
} from '__generated/gql/types';
import { createEvent } from 'common/utils/event';

export const addEndpoint = createEvent<EndpointInsertInput>(
  'ADD_ENDPOINT_REQUESTED'
);
export const deleteEndpoint = createEvent<{ id: string }>(
  'REMOVE_ENDPOINT_REQUESTED'
);
export const updateEndpoint = createEvent<EndpointSetInput>(
  'UPDATE_ENDPOINT_REQUESTED'
);
export const selectEndpoint = createEvent<{ id: string }>(
  'SELECT_ENDPOINT_REQUESTED'
);
