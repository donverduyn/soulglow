import {
  pipe,
  Layer,
  Logger,
  LogLevel,
  Context,
  type Ref,
  SynchronizedRef,
} from 'effect';
import { createRuntimeContext } from 'common/hoc/runtime';
// import { DevTools } from '@effect/experimental';

const rootLayer = pipe(
  // DevTools.layer(),
  Layer.merge(Logger.minimumLogLevel(LogLevel.Debug))
);

export class Hello extends Context.Tag('Hello')<Hello, Ref.Ref<number>>() {}

export const GlobalRuntime = createRuntimeContext(
  Layer.effect(Hello, SynchronizedRef.make(0))
);
