import * as React from 'react';
import { type ManagedRuntime, Effect, pipe, Stream } from 'effect';
import { useRuntime } from './useRuntime';

class EventEmitter<T> {
  private listener: (data: T) => void = () => {};
  emit(data: T) {
    this.listener(data);
  }
  subscribe(listener: (data: T) => void) {
    this.listener = listener;
  }
}

async function* createAsyncIterator<T>(
  emitter: EventEmitter<T>
): AsyncGenerator<T> {
  let resolve: (value: IteratorResult<T>) => void;
  let promise: Promise<IteratorResult<T>> = new Promise(
    (res) => (resolve = res)
  );

  const handler = (data: T) => {
    resolve({ done: false, value: data });
    promise = new Promise((res) => (resolve = res));
  };

  emitter.subscribe(handler);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const result = await promise;
    yield result.value;
  }
}

export const useRuntimeHandler = <T, A, E, R>(
  context: React.Context<
    React.MutableRefObject<ManagedRuntime.ManagedRuntime<R, never> | null>
  >,
  handler: (value: T) => Effect.Effect<A, E, NoInfer<R>>
) => {
  const [emitter] = React.useState(() => new EventEmitter<T>());
  const stream = React.useMemo(
    () =>
      pipe(
        Stream.fromAsyncIterable(createAsyncIterator(emitter), console.log),
        Stream.mapEffect(handler),
        Stream.runDrain
      ),
    [handler, emitter]
  );
  useRuntime(context, stream);
  return emitter.emit.bind(emitter);
};
