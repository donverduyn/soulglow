import {
  Effect,
  Fiber,
  pipe,
  PubSub,
  Queue,
  Runtime,
  Console,
  Cause,
  Ref,
  Scope,
  Exit,
} from 'effect';
import { isFiber, type RuntimeFiber } from 'effect/Fiber';

export abstract class BusService<
  T extends { payload: { action?: string }; topic?: string; type: string },
> {
  private count = Effect.runSync(Ref.make(0));
  constructor(
    private readonly bus: PubSub.PubSub<T>,
    private readonly name: string
  ) {}

  publish(event: T) {
    return this.bus.pipe(PubSub.publish(event));
  }

  register<A, E, R>(
    topic: string = '*',
    fn: (event: T) => Effect.Effect<A, E, R> | RuntimeFiber<A, E>
  ) {
    const bus = this.bus;
    const name = this.name;
    const count = this.count;

    return Effect.gen(function* () {
      const runtime = yield* Effect.runtime();
      const scope = yield* Scope.make();

      yield* Effect.gen(function* () {
        const queue = yield* PubSub.subscribe(bus);
        yield* Ref.updateAndGet(count, (c) => c + 1).pipe(
          Effect.andThen((count) =>
            Console.log(
              `[${name}] registering subscriber, count: ${String(count)}`
            )
          )
        );
        yield* Effect.addFinalizer(() =>
          Effect.gen(function* () {
            yield* Ref.updateAndGet(count, (c) => c - 1);
            yield* Console.log(
              `[${name}] unregistering subscriber, count: ${String(yield* Ref.get(count))}`
            );
          })
        );
        while (true) {
          const item = yield* Queue.take(queue);
          if (
            // @ts-expect-error
            item.payload.topic === topic ||
            item.topic === topic ||
            topic === '*'
          ) {
            if (
              item.type === 'SystemAction' &&
              item.payload.action === 'close'
            ) {
              yield* Scope.close(scope, Exit.void);
            } else {
              console.log(`[${name}] sending`, item, topic);
              const effect = fn(item);
              const value = yield* isFiber(effect)
                ? Fiber.join(effect)
                : effect;
              yield* Console.log(
                `[${name}] confirmation ${String(!value ? 'failed' : value)}`,
                item
              );
            }
          }
        }
      }).pipe(Effect.forkScoped, Scope.extend(scope));
      yield* Effect.addFinalizer(() => Scope.close(scope, Exit.void));

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
