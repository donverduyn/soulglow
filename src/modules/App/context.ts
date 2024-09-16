import { pipe, Layer, Context, PubSub, Effect } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { EventBusService } from 'modules/App/services/EventBusService';

// const AppConfigProvider = ConfigProvider.fromJson({
//   LOG_LEVEL: LogLevel.Debug,
// });

export class EventBus extends Context.Tag('@App/EventBus')<
  EventBus,
  EventBusService
>() {}

export const AppRuntime = createRuntimeContext(layer());

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

// TODO: consider we want to keep actors running at the root level, so they outlive the components that use them. By not replaying the root event bus, but replaying the emitted events from the actors instead, we avoid replayed events from affecting the system. If we design our actors around entities, or models, they are no longer bound to the usage in specific components and the events they emit, would be replayed on component remounts. In this case component bound runtimes, can apply side effects to entity stores. This way every component replicates whatever entity stores it needs to calculate its computed values and the state becomes eventually consistent. We have to think about where to store the implementations of the actors, as they are component agnostic. maybe src/system/actors

// const machine = createMachine({
//   id: 'endpoint',
//   initial: 'idle',
//   states: {
//     idle: {
//       on: {
//         ADD_ENDPOINT_REQUESTED: {
//           actions: emit({ type: 'ADD_ENDPOINT_REQUESTED 2' }),
//         },
//         UPDATE_ENDPOINT_REQUESTED: {
//           actions: emit({ type: 'UPDATE_ENDPOINT_REQUESTED 2' }),
//         },
//       },
//     },
//   },
// });

// const actor = createActor(machine);
// actor.start();
// actor.send({ type: 'ADD_ENDPOINT_REQUESTED' });
