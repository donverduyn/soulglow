import { Effect, Fiber, pipe, PubSub, Queue } from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';
import type { EventType } from 'common/utils/event';

export class EventBusProvider {
  constructor(public readonly bus: PubSub.PubSub<EventType<unknown>>) {}

  publish = (event: EventType<unknown>) => {
    return this.bus.pipe(PubSub.publish(event));
  };

  register = <A, E, R>(
    fn: (
      event: EventType<unknown>
    ) => Effect.Effect<A, E, R> | RuntimeFiber<A, E>
  ) => {
    return pipe(
      this.bus,
      PubSub.subscribe,
      Effect.andThen((sub) =>
        sub.pipe(
          Queue.take,
          Effect.andThen((event) => fn(event)),
          Effect.andThen((result) => {
            return isFiber(result) ? Fiber.join(result) : result;
          }),
          Effect.forever
        )
      ),
      Effect.scoped
      // This is safe, because when fn is an effect, it will still have R inferred from the effect that runs register. If it is a fiber, services have been provided by a different runtime.
    ) as Effect.Effect<A, E, R>;
  };

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so.
}
