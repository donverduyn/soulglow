import * as React from 'react';
import {
  Cause,
  Effect,
  Exit,
  Fiber,
  flow,
  pipe,
  Scope,
  Stream,
  Option,
} from 'effect';
import { v4 as uuidv4 } from 'uuid';
import type { RuntimeContext } from 'context';

/*
This hook returns a function that can be called to trigger an effect.
It returns a promise that resolves to the value of the effect.
*/

export function useRuntimeFn<T, A, E, R>(
  context: RuntimeContext<R>,
  fn:
    | ((value: T) => Effect.Effect<A, E, NoInfer<R>>)
    | Effect.Effect<A, E, NoInfer<R>>
    | null
) {
  const [emitter] = React.useState(() => new EventEmitter<T, A>());
  const stream = React.useMemo(
    () =>
      pipe(
        Stream.fromAsyncIterable(createAsyncIterator(emitter), console.log),
        Stream.filterEffect(() => Effect.sync(() => fn !== null)),
        Stream.mapEffect(({ data, eventId }) =>
          pipe(
            Effect.sync(() => (Effect.isEffect(fn) ? fn : fn!(data))),
            Effect.andThen(Effect.tap(emitter.resolve(eventId)))
          )
        ),
        Stream.runDrain
      ),
    [fn]
  );
  const emit = React.useCallback(
    <T extends Parameters<(typeof emitter)['emit']>[0]>(value: T) =>
      emitter.emit(value),
    []
  );

  React.useEffect(() => {
    return emitter.dispose.bind(emitter);
  }, []);

  useRuntime(context, stream);
  return emit;
}

/*
This hook is used to run an effect in a runtime.
It takes a context and an effect and runs the effect in the runtime provided by the context. It is used by useRuntimeFn.
*/

const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using withRuntime?
  `;

const useRuntime = <A, E, R>(
  context: RuntimeContext<R>,
  task: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtimeRef = React.useContext(context);
  const createScope = React.useCallback(flow(Scope.make, Effect.runSync), []);

  React.useEffect(() => {
    const scope = createScope();
    void pipe(
      task,
      Effect.forkIn(scope),
      Effect.andThen(Fiber.join),
      Effect.catchAllCause((cause) =>
        Cause.isInterruptedOnly(cause) ? Option.some(Exit.void) : Option.none()
      ),
      runtimeRef.current?.runPromise ??
        (() => Promise.reject(new Error(noRuntimeMessage)))
    );

    return () => {
      Effect.runFork(Scope.close(scope, Exit.void));
    };
  }, [task]);
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
  emit(data: T | null = null): Promise<A> {
    const eventId = uuidv4();
    let resolver: (result: A) => void;
    const promise = new Promise<A>((resolve) => {
      resolver = resolve;
    });
    this.eventQueue.push({ data: data as T, eventId });
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
