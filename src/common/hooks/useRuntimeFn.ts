import * as React from 'react';
import { Effect, pipe, Stream, Fiber, FiberId } from 'effect';
import { v4 as uuidv4 } from 'uuid';
import type { RuntimeContext } from 'common/utils/context';

/*
This hook returns a function that can be called to trigger an effect.
It returns a promise that resolves to the value of the effect.
*/

// TODO: accept a function without arguments
export function useRuntimeFn<A, E, R, T>(
  context: RuntimeContext<R>,
  fn:
    | ((value: T) => Effect.Effect<A, E, NoInfer<R>>)
    | Effect.Effect<A, E, NoInfer<R>>
    | null,
  label?: string
) {
  // console.log('useRuntimeFn', label);
  const emitter = React.useMemo(() => new EventEmitter<T, A>(), [fn]);
  const stream = React.useMemo(
    () =>
      pipe(
        Stream.fromAsyncIterable(createAsyncIterator(emitter), console.log),
        Stream.filterEffect(() => Effect.sync(() => fn !== null)),
        Stream.mapEffect(({ data, eventId }) => {
          return pipe(
            Effect.sync(() => (Effect.isEffect(fn) ? fn : fn!(data))),
            Effect.andThen(Effect.tap(emitter.resolve(eventId)))
          );
        }),
        Stream.runDrain
      ),
    [fn]
  );

  useRuntime(context, stream, label);
  return emitter.emit;
}

/*
This hook is used to run an effect in a runtime.
It takes a context and an effect and runs the effect in the runtime provided by the context. It is used by useRuntimeFn.
*/

const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using withRuntime?
  `;

export const useRuntime = <A, E, R>(
  context: RuntimeContext<R>,
  task: Effect.Effect<A, E, NoInfer<R>>,
  label?: string
) => {
  const runtime = React.useContext(context);
  React.useEffect(() => {
    // TODO: handle no runtime
    const f = pipe(task, runtime.runFork);
    return () => Effect.runSync(pipe(f, Fiber.interruptAsFork(FiberId.none)));
  }, [runtime, task]);
};

export const useRuntimeSync = <A, E, R>(
  context: RuntimeContext<R>,
  task: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtime = React.useContext(context);
  const [result, setResult] = React.useState(() => runtime.runSync(task));

  React.useEffect(() => {
    setResult(runtime.runSync(task));
  }, [runtime, task]);

  return result;
};

/* 
This is converting push based events to a pull based stream, where the consumer has control through the provided effect.
Every call to the function returned from useRuntimeFn, returns a promise with the value of the associated effect if it succeeds. 
*/

class EventEmitter<T, A> {
  private listeners: Array<(data: T, eventId: string) => void> = [];
  private resolvers: Map<string, (result: A) => void> = new Map();
  private eventQueue: Array<{ data: T; eventId: string }> = [];

  // TODO: instead of using null, and casting it back to T,
  // TODO: create an override that allows zero arguments
  emit: ((data: T) => Promise<A>) | (() => Promise<A>) = (data) => {
    const eventId = uuidv4();
    let resolver: (result: A) => void;
    const promise = new Promise<A>((resolve) => {
      resolver = resolve;
    });
    this.eventQueue.push({ data, eventId });
    this.notifyListeners();
    this.resolvers.set(eventId, resolver!);
    return promise;
  };

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

  resolve(eventId: string) {
    return (result: A) => {
      const resolver = this.resolvers.get(eventId);
      if (resolver) {
        resolver(result);
        this.resolvers.delete(eventId);
      }
    };
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

  dispose() {
    this.listeners = [];
    this.eventQueue = [];
    this.resolvers.clear();
  }
}

async function* createAsyncIterator<T, A>(
  emitter: EventEmitter<T, A>
): AsyncGenerator<{ data: T; eventId: string }> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    yield await emitter.waitForEvent();
  }
}
