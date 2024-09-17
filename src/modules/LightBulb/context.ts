import { Context, Effect, Layer, Queue, pipe } from 'effect';
import { observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import { createRuntimeContext } from 'common/utils/context';
import { Device } from 'modules/App/models/device/Device';
import { DeviceRepoImpl } from './repos/DeviceRepo';
import { ColorServiceImpl } from './services/ColorService';

export enum LightMode {
  COLOR = 'color',
  NIGHT = 'night',
  SCENE = 'scene',
  WHITE = 'white',
}

export const MODE_ITEMS = observable.array([
  { id: uuid(), label: 'Color', value: LightMode.COLOR },
  { id: uuid(), label: 'White', value: LightMode.WHITE },
]);

// interface Crudable<T, E> {
//   create: (dto: T) => Effect.Effect<T | BooleanResponse | undefined, E>;
//   delete: () => Effect.Effect<BooleanResponse | undefined, E>;
//   read: () => Effect.Effect<T | undefined, E>;
//   update: (dto: T) => Effect.Effect<T | BooleanResponse | undefined, E>;
// }

export class ApiThrottler extends Context.Tag('@Lightbulb/Throttler')<
  ApiThrottler,
  Queue.Queue<Device>
>() {}

export class DeviceRepo extends Context.Tag('@Lightbulb/DeviceRepo')<
  DeviceRepo,
  DeviceRepoImpl
>() {}

export class ColorService extends Context.Tag('@Lightbulb/ColorService')<
  ColorService,
  ColorServiceImpl
>() {}

export const LightBulbRuntime = createRuntimeContext(layer());

// TODO: use service with constructor injection instead of using ApiThrottler directly
function layer() {
  return pipe(
    Layer.scopedDiscard(
      pipe(
        Effect.gen(function* () {
          const queue = yield* ApiThrottler;
          const item = yield* queue.take;
          console.log(item);

          const repo = yield* DeviceRepo;
          yield* repo.update(item);
          yield* Effect.logDebug('Queue take', item);
        }),
        Effect.forever,
        Effect.forkScoped
      )
    ),
    Layer.provideMerge(
      Layer.scoped(
        ApiThrottler,
        Effect.gen(function* () {
          const queue = yield* Queue.sliding<Device>(1);
          yield* Effect.addFinalizer(() =>
            Effect.gen(function* () {
              yield* Queue.shutdown(queue);
              yield* Effect.logDebug('Queue shutdown');
            })
          );
          return queue;
        })
      )
    ),
    Layer.provideMerge(
      Layer.effect(
        ColorService,
        pipe(
          DeviceRepo,
          Effect.andThen((repo) => new ColorServiceImpl(repo))
        )
      )
    ),
    Layer.provideMerge(
      Layer.effect(
        DeviceRepo,
        Effect.sync(() => new DeviceRepoImpl())
      )
    )
  );
}
