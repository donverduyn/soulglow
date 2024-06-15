import { Context, Ref, Layer } from 'effect';
import { createRuntimeContext } from 'common/hoc/runtime';
import { createEntityStore } from 'common/utils/entity';

export class Count extends Context.Tag('@MyComponent/Count')<
  Count,
  Ref.Ref<number>
>() {}

export const TestButtonRuntime = createRuntimeContext(
  Layer.effect(Count, Ref.make(0))
);

class TestButtonStore {
  store = {
    lightBulb: createEntityStore<LightBulb>(),
  }
  // inject pubsub
  // inject services
  // listen for messages, update stores
  // provide methods, publish messages, call services, update stores
}

class ModuleStore {
  // set provides a function that sets the value of a specific property based on the dot separated path that is provided as the first argument.
  // for example set(')
  set() {

  }

  lazyGet() {

  }
}