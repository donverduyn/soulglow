import { v4 as uuid } from 'uuid';

export const createEndpoint = (id?: string): Endpoint => {
  const _id = id ?? uuid();
  return {
    id: _id,
    name: `endpoint-${_id}`,
    url: 'http://192.168.0.153',
  };
};

export type Endpoint = {
  id: string;
  name: string;
  url: string;
};
