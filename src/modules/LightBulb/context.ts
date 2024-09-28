import { Effect, Layer, Queue, pipe } from 'effect';
import { observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import { createRuntimeContext } from 'common/utils/context';
import { Device } from 'models/device';
import { DeviceRepoImpl } from './repos/DeviceRepo';
import { ColorServiceImpl } from './services/ColorService';
import * as Tags from './tags';

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

// TODO: use service with constructor injection instead of using ApiThrottler directly

export const LightBulbRuntime = pipe(
  Layer.scopedDiscard(
    pipe(
      Effect.gen(function* () {
        const queue = yield* Tags.ApiThrottler;
        const item = yield* queue.take;
        console.log(item);

        const repo = yield* Tags.DeviceRepo;
        yield* repo.update(item);
        yield* Effect.logDebug('Queue take', item);
      }),
      Effect.forever,
      Effect.forkScoped
    )
  ),
  Layer.provideMerge(
    Layer.scoped(
      Tags.ApiThrottler,
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
      Tags.ColorService,
      pipe(
        Tags.DeviceRepo,
        Effect.andThen((repo) => new ColorServiceImpl(repo))
      )
    )
  ),
  Layer.provideMerge(
    Layer.effect(
      Tags.DeviceRepo,
      Effect.sync(() => new DeviceRepoImpl())
    )
  ),
  createRuntimeContext
);
