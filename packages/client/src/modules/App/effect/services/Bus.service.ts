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
  private topicSubCount = Effect.runSync(Ref.make<Record<string, number>>({}));
  private exitHandlers = Effect.runSync(
    Ref.make<Record<string, (() => Effect.Effect<void>)[]>>({})
  );

  constructor(
    private readonly bus: PubSub.PubSub<T>,
    private readonly name: string
  ) {}

  publish(event: T) {
    return this.bus.pipe(PubSub.publish(event));
  }

  registerExit(topic: string, fn: () => Effect.Effect<void>) {
    return pipe(
      this.exitHandlers,
      Ref.update((handlers) => ({
        ...handlers,
        [topic]: (handlers[topic] ?? []).concat(fn),
      }))
    );
  }

  register<A, E, R>(
    topic: string = '*',
    fn: (event: T) => Effect.Effect<A, E, R> | RuntimeFiber<A, E>
  ) {
    const bus = this.bus;
    const name = this.name;
    const topicSubCount = this.topicSubCount;
    const exitHandlers = this.exitHandlers;

    return Effect.gen(function* () {
      const runtime = yield* Effect.runtime();
      const scope = yield* Scope.make();

      yield* Effect.gen(function* () {
        const queue = yield* PubSub.subscribe(bus);
        yield* Ref.updateAndGet(topicSubCount, (c) => ({
          ...c,
          [topic]: c[topic] ? c[topic] + 1 : 1,
        })).pipe(
          Effect.andThen((count) =>
            Console.log(
              `[${name}] registering subscriber on ${topic}, count: ${String(count[topic])}`
            )
          )
        );
        yield* Effect.addFinalizer(() =>
          pipe(
            Ref.updateAndGet(topicSubCount, (c) => ({
              ...c,
              [topic]: c[topic] - 1,
            })),
            Effect.tap((count) =>
              Console.log(
                `[${name}] unregistering subscriber for topic ${topic}, count: ${String(count[topic])}`
              )
            ),
            Effect.tap((count) => {
              return Effect.gen(function* () {
                if (count[topic] === 0) {
                  yield* Console.log(
                    `[${name}] calling exit handlers for topic ${topic}`
                  );
                  const handlers = yield* Ref.get(exitHandlers);
                  const exitFns = handlers[topic] ?? [];
                  yield* Effect.forEach(exitFns, (fn) => fn());
                  yield* Ref.update(exitHandlers, (handlers) => ({
                    ...handlers,
                    [topic]: [],
                  }));
                } else {
                  yield* Console.log(
                    `[${name}] no exit handlers for topic ${topic}`
                  );
                }
              });
            })
          )
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
