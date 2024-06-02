import { Context, Effect, Layer, Queue, pipe } from 'effect';
import { observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import type { GroupState, GroupStateCommands } from '__generated/api';
import { createRuntimeContext } from 'common/hoc/runtime';
import { createDeviceRepo } from './repos/DeviceRepo';

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

export class ApiThrottler extends Context.Tag('@Lightbulb/Throttler')<
  ApiThrottler,
  Queue.Queue<Partial<GroupState>>
>() {}

export class TweenTarget extends Context.Tag('@Lightbulb/TweenTarget')<
  TweenTarget,
  Queue.Queue<Partial<GroupState>>
>() {}

export class DeviceRepo extends Context.Tag('@Lightbulb/DeviceRepo')<
  DeviceRepo,
  ReturnType<typeof createDeviceRepo>
>() {}

const take = pipe(
  Effect.gen(function* () {
    const queue = yield* ApiThrottler;
    const item = yield* queue.take;
    console.log(item);

    const target = yield* TweenTarget;
    yield* target.offer(item);

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
    Layer.provideMerge(Layer.scoped(TweenTarget, singleItemQueue)),
    Layer.provideMerge(Layer.effect(DeviceRepo, Effect.sync(createDeviceRepo)))
  )
);
