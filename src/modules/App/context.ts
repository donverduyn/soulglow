import { pipe, Layer } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import { browserLogger } from 'common/utils/effect';
import { eventBusLayer, eventBusPubSubLayer } from './effect/layers/layers';

// TODO: think about how we want to use this from commom/utils/effect
// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export const AppRuntime = pipe(
  eventBusLayer,
  Layer.provide(eventBusPubSubLayer),
  Layer.merge(browserLogger),
  createRuntimeContext
);
