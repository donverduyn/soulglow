import type { Endpoint } from './models/Endpoint';

const createMessage =
  <T>(message: string) =>
  (payload: T) => ({
    message,
    payload,
  });

export const endpointActions = {
  add: createMessage<Endpoint>('ENDPOINT_ADD'),
  remove: createMessage<string>('ENDPOINT_REMOVE'),
  select: createMessage<number>('ENDPOINT_SELECT'),
  update: createMessage<Endpoint>('ENDPOINT_UPDATE'),
};
