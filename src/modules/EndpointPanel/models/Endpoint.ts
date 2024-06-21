import { v4 as uuid } from 'uuid';

export const createEndpoint = (overrides?: Partial<Endpoint>): Endpoint => {
  const id = overrides?.id ?? uuid();
  return {
    id,
    name: overrides?.name ?? `endpoint-${id}`,
    url: overrides?.url ?? 'http://localhost:8081',
  };
};

export type Endpoint = {
  id: string;
  name: string;
  url: string;
};
