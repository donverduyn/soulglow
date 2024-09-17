import { Chunk, Effect, Logger, pipe, Runtime, Sink, Stream } from 'effect';

// Common Error types

export class FetchError {
  readonly _tag = 'FetchError';
}

// Common layers

export const browserLogger = Logger.replace(
  Logger.defaultLogger,
  Logger.withLeveledConsole(Logger.stringLogger)
);

// Common runtime utils

export const getRunFork = Effect.runtime().pipe(
  Effect.andThen(Runtime.runFork)
);

// Common stream operators

export const groupDebounce = <T>(threshold: number) => {
  const symbol = Symbol('END');
  return (stream: Stream.Stream<T>) =>
    pipe(
      stream,
      Stream.broadcast(2, 1),
      Stream.flatMap(([first, second]) =>
        pipe(
          first,
          Stream.debounce(threshold),
          Stream.aggregate(pipe(Sink.drain, Sink.as(symbol as T))),
          Stream.merge(second),
          Stream.split((item) => item === symbol),
          Stream.map(Chunk.toArray)
        )
      )
    );
};
