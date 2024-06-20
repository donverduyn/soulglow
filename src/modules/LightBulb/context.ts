import { Context, Effect, Layer, Queue, pipe } from 'effect';
import { observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import type {
  BooleanResponse,
  GroupState,
  GroupStateCommands,
} from '__generated/api';
import { createRuntimeContext } from 'context';
import { createDeviceRepo } from './repos/DeviceRepo';

// we really shouldn't couple our dto with the api types
export type LightbulbDto = GroupState & GroupStateCommands;

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

interface Crudable<T, E> {
  create: (dto: T) => Effect.Effect<T | BooleanResponse | undefined, E>;
  delete: () => Effect.Effect<BooleanResponse | undefined, E>;
  read: () => Effect.Effect<T | undefined, E>;
  update: (dto: T) => Effect.Effect<T | BooleanResponse | undefined, E>;
}

export class FetchError {
  readonly _tag = 'FetchError';
}

export class ApiThrottler extends Context.Tag('@Lightbulb/Throttler')<
  ApiThrottler,
  Queue.Queue<Partial<LightbulbDto>>
>() {}

export class DeviceRepo extends Context.Tag('@Lightbulb/DeviceRepo')<
  DeviceRepo,
  Crudable<LightbulbDto, FetchError>
>() {}

const take = pipe(
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
);

const singleItemQueue = Effect.gen(function* () {
  const queue = yield* Queue.sliding<LightbulbDto>(1);
  yield* Effect.addFinalizer(() =>
    Effect.gen(function* () {
      yield* Queue.shutdown(queue);
      yield* Effect.logDebug('Queue shutdown');
    })
  );
  return queue;
});

// this breaks fast-refresh unfortunately even though it is nice this way.
// maybe we can export this from constants.ts or another file at the module root
export const LightBulbRuntime = createRuntimeContext(
  pipe(
    Layer.scopedDiscard(take),
    Layer.provideMerge(Layer.scoped(ApiThrottler, singleItemQueue)),
    Layer.provideMerge(Layer.effect(DeviceRepo, Effect.sync(createDeviceRepo)))
  )
);
