import { Queue, Effect } from 'effect';

export type Options = {
  capacity: number;
  delay: number;
  type: 'sliding' | 'dropping' | 'bounded';
};

export const queue = <T>({ type, capacity }: Options) =>
  Effect.gen(function* () {
    const queue = yield* Queue[type]<T>(capacity);

    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        yield* Queue.shutdown(queue);
        yield* Effect.logDebug('Queue shutdown');
      })
    );
    // ready to go
    return queue;
  });
