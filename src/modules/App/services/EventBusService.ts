import { Effect, Fiber, PubSub, Queue } from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';
import type { EventType } from 'common/utils/event';

export class EventBusService {
  constructor(private readonly bus: PubSub.PubSub<EventType<unknown>>) {}

  publish = (event: EventType<unknown>) => {
    return this.bus.pipe(PubSub.publish(event));
  };

  register = <A, E, R>(
    fn: (event: EventType<unknown>) => Effect.Effect<A, E, R> | RuntimeFiber<R>
  ) => {
    return this.bus.pipe(
      PubSub.subscribe,
      Effect.andThen((sub) =>
        sub.pipe(
          Queue.take,
          Effect.andThen(fn),
          Effect.andThen((result) =>
            isFiber(result) ? Fiber.join(result) : result
          ),
          Effect.forever
        )
      ),
      Effect.scoped
    );
  };

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so.
}
