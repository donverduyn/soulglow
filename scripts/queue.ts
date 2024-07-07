import { Deferred, Effect, Fiber, Queue, Array, pipe } from 'effect';

const print = (value: number) =>
  pipe(
    Effect.log(`Consuming value: '${String(value)}'`),
    // delay before consuming the next consumer result
    Effect.delay('200 millis'),
    Effect.as(`Processed value: '${String(value)}'`),
    Effect.onInterrupt(() => Effect.log('Work was interrupted!'))
  );

const program = Effect.gen(function* (_) {
  const queue = yield* _(
    Queue.unbounded<[number, Deferred.Deferred<string>]>()
  );

  const produceWork = (value: number): Effect.Effect<string> =>
    Deferred.make<string>().pipe(
      Effect.andThen((deferred) =>
        Queue.offer(queue, [value, deferred]).pipe(
          Effect.zipRight(Deferred.await(deferred)),
          Effect.onInterrupt(() =>
            Effect.log('Production of work was interrupted!').pipe(
              Effect.zipRight(Deferred.interrupt(deferred))
            )
          )
        )
      )
    );

  const consumeWork: Effect.Effect<void> = Queue.take(queue).pipe(
    Effect.andThen(([value, deferred]) =>
      Effect.if(Deferred.isDone(deferred), {
        onFalse: () =>
          print(value).pipe(
            // delay after work is done
            Effect.zipLeft(Effect.sleep('1 seconds')),
            Effect.exit,
            Effect.andThen((result) => Deferred.complete(deferred, result)),
            Effect.race(Deferred.await(deferred)),
            Effect.fork
          ),
        onTrue: () => Effect.void,
      })
    ),
    Effect.forever
  );

  const fiber = yield* _(
    consumeWork,
    Effect.annotateLogs('role', 'consumer'),
    Effect.fork
  );

  yield* _(
    Effect.forEach(
      Array.range(0, 10),
      (value) => produceWork(value).pipe(Effect.andThen(Effect.log)),
      { concurrency: 'unbounded' }
    ),
    Effect.zipRight(produceWork(11).pipe(Effect.timeout('10 millis'))),
    Effect.annotateLogs('role', 'producer')
  );

  yield* _(Fiber.join(fiber));
});

program.pipe(Effect.tapErrorCause(Effect.logError), Effect.runFork);
