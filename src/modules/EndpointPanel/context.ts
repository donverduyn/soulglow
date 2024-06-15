import { Context, Effect, Layer } from 'effect';
import { createRuntimeContext } from 'common/hoc/runtime';
import {
  createEntityStore,
  withSelected,
  type EntityStore,
  type WithSelected,
} from 'common/utils/entity';

export type Endpoint = {
  id: string;
  name: string;
  url: string;
};

export class EndpointStore extends Context.Tag('EndpointStore')<
  EndpointStore,
  WithSelected<Endpoint> & EntityStore<Endpoint>
>() {}

export const EndpointRuntime = createRuntimeContext(
  Layer.effect(
    EndpointStore,
    Effect.gen(function* () {
      return yield* Effect.sync(() =>
        withSelected(createEntityStore<Endpoint>)
      );
    })
  )
);
