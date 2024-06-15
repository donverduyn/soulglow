import * as React from 'react';
import { Effect, pipe, Stream } from 'effect';
import { v4 as uuidv4 } from 'uuid';
import type { RuntimeContext } from 'context';
import { useRuntime } from './useRuntime';

class EventEmitter<T, A> {
  private listeners: Array<(data: T, eventId: string) => void> = [];
  private resolvers: Map<string, (result: A) => void> = new Map();
  private eventQueue: Array<{ data: T; eventId: string }> = [];

  emit(data: T): Promise<A> {
    const eventId = uuidv4();
    let resolver: (result: A) => void;
    const promise = new Promise<A>((resolve) => {
      resolver = resolve;
    });
    this.eventQueue.push({ data, eventId });
    this.notifyListeners();
    this.resolvers.set(eventId, resolver!);
    return promise;
  }

  subscribe(listener: (data: T, eventId: string) => void): void {
    this.listeners.push(listener);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    while (this.eventQueue.length > 0 && this.listeners.length > 0) {
      const event = this.eventQueue.shift()!;
      this.listeners.forEach((listener) => listener(event.data, event.eventId));
    }
  }

  resolve(eventId: string, result: A): void {
    const resolver = this.resolvers.get(eventId);
    if (resolver) {
      resolver(result); // Pass the result to the resolver function
      this.resolvers.delete(eventId);
    }
  }

  async waitForEvent(): Promise<{ data: T; eventId: string }> {
    if (this.eventQueue.length > 0) {
      return Promise.resolve(this.eventQueue.shift()!);
    }

    return new Promise((resolve) => {
      const oneTimeListener = (data: T, eventId: string) => {
        resolve({ data, eventId });
        this.listeners = this.listeners.filter((l) => l !== oneTimeListener);
      };
      this.subscribe(oneTimeListener);
    });
  }
}
async function* createAsyncIterator<T, A>(
  emitter: EventEmitter<T, A>
): AsyncGenerator<{ data: T; eventId: string }> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const event = await emitter.waitForEvent();
    yield event;
  }
}

export const useRuntimeHandler = <T, A, E, R>(
  context: RuntimeContext<R>,
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
