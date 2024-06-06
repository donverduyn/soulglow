import { Context, Ref, Layer } from 'effect';
import { createRuntimeContext } from 'common/hoc/runtime';

export class Count extends Context.Tag('@MyComponent/Count')<
  Count,
  Ref.Ref<number>
>() {}

export const TestButtonRuntime = createRuntimeContext(
  Layer.effect(Count, Ref.make(0))
);
