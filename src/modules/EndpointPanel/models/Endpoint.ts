import { v4 as uuid } from 'uuid';
import type { Endpoint } from 'common/models/endpoint/endpoint';

// The reason we keep models at the module level, is because in common, we have the base models that are shared across the application, and in the module, we have the models that are specific to the module. This way, we can keep the common models clean and focused on the core domain, and the module models can be more specific and tailored to the needs of the module.

export const createEndpoint = (overrides?: Partial<Endpoint>): Endpoint => {
  const id = overrides?.id ?? uuid();
  return {
    id,
    name: overrides?.name ?? `endpoint-${id}`,
    url: overrides?.url ?? 'http://localhost:8081',
  };
};
