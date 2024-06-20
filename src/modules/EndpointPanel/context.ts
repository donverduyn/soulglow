import { Context, Effect, Layer, pipe } from 'effect';
import { createRuntimeContext } from 'common/hoc/withRuntime';
import {
  createEntityStore,
  withFiltered,
  withSelected,
} from 'common/utils/entity';
import type { Endpoint } from './models/Endpoint';

export class EndpointStore extends Context.Tag('@EndpointPanel/EndpointStore')<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected,
  withFiltered
);

export const EndpointPanelRuntime = createRuntimeContext(
  Layer.effect(
    EndpointStore,
    Effect.sync(() => Object.assign(createEndpointStore(), { id: 'real' }))
  )
);
