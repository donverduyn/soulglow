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
  Ref
} from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';

export abstract class BusService<T> {
  private count = Effect.runSync(Ref.make(0));
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
    const count = this.count;

    return Effect.gen(function* () {
      const runtime = yield* Effect.runtime();
      const scope = yield* Scope.make();
  
      const fiber = yield* Effect.gen(function* () {
        const queue = yield* PubSub.subscribe(bus);
        yield* Ref.updateAndGet(count, (c) => c + 1)
        .pipe(Effect.andThen((count) => Console.log(
          `[${name}] registering subscriber, count: ${count}`
        )));

        yield* Effect.addFinalizer(() =>
          Effect.gen(function* () { 
            const count2 = yield* Ref.updateAndGet(count, (c) => c - 1)
            ;
            yield* Console.log(
              `[${name}] unregistering subscriber, count: ${yield* Ref.get(count)}`
            );
          })
        );
        while (true) {
          const item = yield* Queue.take(queue);
          const effect = fn(item);
          const value = yield* isFiber(effect) ? Fiber.join(effect) : effect;
          yield* Console.log(
            `[${name}] confirmation ${!value ? 'failed' : value}`,
            item
          );
        }
      }).pipe(Effect.forkScoped, Scope.extend(scope));

      // yield* Fiber.join(fiber)

      return () =>
        Runtime.runPromise(
          runtime,
          pipe(
            Fiber.interrupt(fiber),
            Effect.zipRight(Scope.close(scope, Exit.void)),
            Effect.andThen(Effect.succeed(true)),
            Effect.catchAllCause((e) =>
              Effect.succeed(Cause.isInterruptedOnly(e))
            )
          )
        );
    })
  }
}
