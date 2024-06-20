import { Context, Ref, Layer } from 'effect';
import { createEntityStore } from 'common/utils/entity';
import { createRuntimeContext } from 'context';

export class Count extends Context.Tag('@MyComponent/Count')<
  Count,
  Ref.Ref<number>
>() {}

export const TestButtonRuntime = createRuntimeContext(
  Layer.effect(Count, Ref.make(0))
);

export class TestButtonStore {
  store = {
    lightBulb: createEntityStore(),
  };
  // inject pubsub
  // inject services
  // listen for messages, update stores
  // provide methods, publish messages, call services, update stores
}

export class ModuleStore {
  // set provides a function that sets the value of a specific property based on the dot separated path that is provided as the first argument.
  // for example set(')
  set() {}

  lazyGet() {}
}
