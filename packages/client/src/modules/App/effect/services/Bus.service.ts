import { Effect, Fiber, pipe, PubSub, Queue } from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';

export abstract class BusService<T> {
  constructor(public readonly eventBus: PubSub.PubSub<T>) {}

  publish(event: T) {
    return this.eventBus.pipe(PubSub.publish(event));
  }

  register<A, E, R>(
    fn: (event: T) => Effect.Effect<A, E, R> | RuntimeFiber<A, E>
  ) {
    // console.log('[BusService/register]', fn);
    return pipe(
      this.eventBus,
      PubSub.subscribe,
      Effect.andThen((queue) =>
        queue.pipe(
          Queue.take,
          Effect.map(fn),
          Effect.andThen((result) =>
            isFiber(result) ? Fiber.join(result) : result
          ),
          Effect.forever
        )
      ),
      Effect.scoped
      // This is safe, because when fn is an effect, it will still have R inferred from the effect that runs register. If it is a fiber, services have been provided by a different runtime.
    ) as Effect.Effect<A, E, R>;
  }

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so.
}
