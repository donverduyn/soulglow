import { pipe, Layer, Context, PubSub, Effect } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { EventBusService } from 'modules/App/services/EventBusService';
// import { DevTools } from '@effect/experimental';

// const rootLayer = pipe(
//   // DevTools.layer(),
//   Layer.merge(Logger.minimumLogLevel(LogLevel.Debug))
// );

// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export class EventBus extends Context.Tag('@App/EventBus')<
  EventBus,
  EventBusService
>() {}

export const AppRuntime = createRuntimeContext(layer);

function layer() {
  return pipe(
    Layer.scoped(
      EventBus,
      Effect.gen(function* () {
        const bus = yield* PubSub.unbounded<EventType<unknown>>({
          replay: Number.POSITIVE_INFINITY,
        });
        return new EventBusService(bus);
      })
    )
  );
}
