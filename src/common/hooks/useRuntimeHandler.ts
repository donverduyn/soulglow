import * as React from 'react';
import { type ManagedRuntime, Effect, pipe, Stream } from 'effect';
import { v4 as uuidv4 } from 'uuid';
import { useRuntime } from './useRuntime';

class EventEmitter<T, R> {
  private listener: (data: T, eventId: string) => void = () => {};
  private resolvers: Map<string, (value: R) => void> = new Map();

  emit(data: T): Promise<R> {
    const eventId = uuidv4();
    const promise = new Promise<R>((resolve) => {
      this.resolvers.set(eventId, resolve);
      this.listener(data, eventId);
    });
    return promise;
  }

  subscribe(listener: (data: T, eventId: string) => void): void {
    this.listener = listener;
  }

  resolve(eventId: string, result: R): void {
    const resolver = this.resolvers.get(eventId);
    if (resolver) {
      resolver(result);
      this.resolvers.delete(eventId);
    }
  }
}

async function* createAsyncIterator<T, R>(
  emitter: EventEmitter<T, R>
): AsyncGenerator<{ data: T; eventId: string }> {
  let resolve: (value: IteratorResult<{ data: T; eventId: string }>) => void;
  let promise: Promise<IteratorResult<{ data: T; eventId: string }>> =
    new Promise((res) => (resolve = res));

  function handler(data: T, eventId: string) {
    resolve({ done: false, value: { data, eventId } });
    promise = new Promise((res) => (resolve = res));
  }

  emitter.subscribe(handler);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const result = await promise;
    yield result.value;
  }
}

// TODO: think about interrupting the fiber after inactivity, to avoid hogging
// TODO: lazily create the stream again after inactivity? or maybe configure the stream to be lazy
export const useRuntimeHandler = <T, A, E, R>(
  context: React.Context<
    React.MutableRefObject<ManagedRuntime.ManagedRuntime<R, never> | null>
  >,
  handler: (value: T) => Effect.Effect<A, E, NoInfer<R>>
) => {
  const emitter = React.useMemo(() => new EventEmitter<T, A>(), []);
  const stream = React.useMemo(
    () =>
      pipe(
        Stream.fromAsyncIterable(createAsyncIterator(emitter), console.log),
        Stream.mapEffect(({ data, eventId }) =>
          Effect.gen(function* () {
            const result = yield* handler(data);
            emitter.resolve(eventId, result);
          })
        ),
        Stream.runDrain
      ),
    [handler, emitter]
  );
  useRuntime(context, stream);
  return emitter.emit.bind(emitter);
};
