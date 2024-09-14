import {
  Stream,
  Console,
  Effect,
  pipe,
  Context,
  Layer,
  ManagedRuntime,
  Queue,
} from 'effect';

export class Bus extends Context.Tag(`Bus`)<Bus, Queue.Queue<number>>() {}

const runtime = ManagedRuntime.make(
  Layer.effect(Bus, Queue.unbounded<number>())
);

const program = pipe(
  Effect.gen(function* () {
    yield* pipe(
      Stream.fromQueue(yield* Bus),
      Stream.broadcast(1, 40),
      Stream.flatMap(([first]) =>
        pipe(
          // Stream.fromIterable([100]),
          // Stream.concat(first),
          // Stream.

          // Stream.repeat(Schedule.spaced(100)),
          first,
          Stream.debounce(10),
          // Stream.
          // Stream.map(() => uuid()),
          // Stream.drain,
          Stream.zip(first)
          // Stream.runCollect
        )
      ),
      Stream.tap(Console.log),
      Stream.runDrain
    );
  })
);

// Sink.
// Stream.aggregate

runtime.runFork(program);

for (let i = 0; i < 50; i++) {
  ((i: number) => {
    setTimeout(() => {
      runtime.runFork(pipe(Bus, Effect.andThen(Queue.offer(i))));
    }, i * 50);
  })(i);
}
