// // the minimum required fields for an endpoint that are applicable across bounded contexts
import { v4 as uuid } from 'uuid';
export interface Endpoint extends Identifiable {
  name: string;
  url: string;
}

// TODO: We might want to keep separate interfaces at the module level, so modules can deal with any resource that implements the interface.

export const createEndpoint = (overrides?: Partial<Endpoint>): Endpoint => {
  const id = overrides?.id ?? uuid();
  return {
    id,
    name: overrides?.name ?? `endpoint-${id}`,
    url: overrides?.url ?? 'http://localhost:8081',
  };
};
