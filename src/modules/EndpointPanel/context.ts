import { Context, Effect, Layer, pipe } from 'effect';
import { createRuntimeContext } from 'common/hoc/withRuntime';
import {
  createEntityStore,
  withFiltered,
  withSelected,
} from 'common/utils/entity';

export type Endpoint = {
  id: string;
  name: string;
  url: string;
};

export class EndpointStore extends Context.Tag('EndpointStore')<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected,
  withFiltered
);

export const EndpointRuntime = createRuntimeContext(
  Layer.effect(
    EndpointStore,
    // here we can provide any dependencies that the store needs
    Effect.sync(() => createEndpointStore())
  )
);
