import {
  Stream,
  Console,
  Effect,
  pipe,
  Context,
  Layer,
  ManagedRuntime,
  Queue,
  Sink,
  Chunk,
} from 'effect';
export class Bus extends Context.Tag(`Bus`)<Bus, Queue.Queue<number>>() {}

const runtime = ManagedRuntime.make(
  Layer.effect(Bus, Queue.unbounded<number>())
);

const DEBOUNCE_THRESHOLD = 10;

const program = Effect.gen(function* () {
  yield* pipe(
    Stream.fromQueue(yield* Bus),
    Stream.broadcast(2, 1),
    Stream.flatMap(([first, second]) =>
      pipe(
        first,
        Stream.debounce(DEBOUNCE_THRESHOLD),
        Stream.aggregate(pipe(Sink.drain, Sink.as(null))),
        Stream.merge(second),
        Stream.split((item) => item === null),
        Stream.map(Chunk.toArray)
      )
    ),
    Stream.tap(Console.log),
    Stream.runDrain
  );
});

runtime.runFork(program);

for (let i = 0; i < 3; i++) {
  ((a: number) => {
    setTimeout(() => {
      for (let j = 0; j < 10; j++) {
        ((b: number) => {
          setTimeout(
            () => {
              // console.log(`Emitting ${(a * 10 + b).toString()}`);
              runtime.runFork(
                pipe(Bus, Effect.andThen(Queue.offer(a * 10 + b)))
              );
            },
            b * (DEBOUNCE_THRESHOLD * 0.5)
          );
        })(j);
      }
    }, a * 500);
  })(i);
}
