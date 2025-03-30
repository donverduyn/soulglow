import {
  Effect,
  Fiber,
  pipe,
  PubSub,
  Queue,
  Runtime,
  Console,
  Cause,
  Scope,
  Exit,
} from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';

export abstract class BusService<T> {
  constructor(
    private readonly bus: PubSub.PubSub<T>,
    private readonly name: string
  ) {}

  publish(event: T) {
    return this.bus.pipe(PubSub.publish(event));
  }

  register<A, E, R>(
    fn: (event: T) => Effect.Effect<A, E, R> | RuntimeFiber<A, E>
  ) {
    const bus = this.bus;
    const name = this.name;

    return Effect.gen(function* () {
      const runtime = yield* Effect.runtime();
      const scope = yield* Scope.make();

      yield* Effect.gen(function* () {
        const queue = yield* PubSub.subscribe(bus);
        yield* Console.log(`[${name}/BusService] Register`);

        yield* Effect.addFinalizer(() =>
          Console.log(`[${name}/BusService] Unregister`)
        );
        while (true) {
          const item = yield* Queue.take(queue);
          const effect = fn(item);
          const value = yield* isFiber(effect) ? Fiber.join(effect) : effect;
          yield* Console.log(
            `[${name}/BusService] Confirmation: ${value ? 'Succeeded' : 'Failed'}:`,
            item
          );
        }
      }).pipe(Effect.forkScoped, Scope.extend(scope));

      return () =>
        Runtime.runPromise(
          runtime,
          pipe(
            Scope.close(scope, Exit.void),
            Effect.andThen(Effect.succeed(true)),
            Effect.catchAllCause((e) =>
              Effect.succeed(Cause.isInterruptedOnly(e))
            )
          )
        );
    });
  }
}
