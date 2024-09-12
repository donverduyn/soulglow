import { createEvent } from 'common/utils/event';
import type { Endpoint } from './endpoint';

export const addEndpointRequested = createEvent(
  'ADD_ENDPOINT_REQUESTED',
  (endpoint: Endpoint) => ({ endpoint })
);

export const removeEndpointRequested = createEvent(
  'REMOVE_ENDPOINT_REQUESTED',
  (id: string) => ({ id })
);

export const updateEndpointRequested = createEvent(
  'UPDATE_ENDPOINT_REQUESTED',
  (endpoint: Partial<Endpoint>) => ({ endpoint })
);

export const selectEndpointRequested = createEvent(
  'SELECT_ENDPOINT_REQUESTED',
  (id: string) => ({ id })
);
