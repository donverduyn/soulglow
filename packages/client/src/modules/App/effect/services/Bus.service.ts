import {
  Effect,
  Fiber,
  pipe,
  PubSub,
  Queue,
  Runtime,
  Console,
  Cause,
} from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';

export abstract class BusService<T> {
  constructor(public readonly eventBus: PubSub.PubSub<T>) {}

  publish(event: T) {
    return this.eventBus.pipe(PubSub.publish(event));
  }

  register<A, E, R>(
    fn: (event: T) => Effect.Effect<A, E, R> | RuntimeFiber<A, E>
  ) {
    return pipe(
      this.eventBus,
      PubSub.subscribe,
      Effect.tap(() => Console.log('[AppRuntime/BusService] Subscribe')),
      Effect.andThen((queue) =>
        queue.pipe(
          Queue.take,
          Effect.map(fn),
          Effect.andThen((result) =>
            isFiber(result) ? Fiber.join(result) : result
          ),
          Effect.forever,
          Effect.forkScoped,
          Effect.tap(
            Effect.addFinalizer(() =>
              Console.log('[AppRuntime/BusService] Unsubscribe')
            )
          )
        )
      ),
      Effect.andThen(Fiber.join),
      Effect.scoped,
      Effect.andThen((fiber) =>
        Effect.gen(function* () {
          console.log('[AppRuntime/BusService] Finalize', fiber);
          const runtime = yield* Effect.runtime();
          return () =>
            Runtime.runPromise(
              runtime,
              pipe(
                Fiber.interrupt(fiber),
                Effect.andThen(Effect.succeed(true)),
                Effect.catchAllCause((e) =>
                  Effect.succeed(Cause.isInterruptedOnly(e))
                )
              )
            );
        })
      )
    );
  }

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so.
}
