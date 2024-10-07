import * as React from 'react';
import {
  Effect,
  pipe,
  Fiber,
  FiberId,
  Stream,
  Console,
  Queue,
  type ManagedRuntime,
} from 'effect';
import type { IsUnknown } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import type { RuntimeContext } from 'common/utils/context';
import { isReactContext } from 'common/utils/react';

//* It is important to note that the runtime of the host component should always be provided to the dependency array, if runtimes higher up the tree are accessed using useRuntimeFn, useRuntime or useRuntimeSync. This is automatically done by WithRuntime its attachTo utility function and might be something to recommend, because this creates a good overview of how the component interacts with external runtimes.

/*
This hook returns a function that can be called to trigger an effect.
It returns a promise that resolves to the value of the effect.
*/

export function useRuntimeFn<A, E, R, T>(
  context: RuntimeContext<R>,
  fn:
    | ((value: T) => Effect.Effect<A, E, NoInfer<R>>)
    | Effect.Effect<A, E, NoInfer<R>>,
  deps: React.DependencyList = []
) {
  const runtime = React.useContext(context);
  const finalDeps = [runtime, ...deps];

  const emitter = React.useMemo(() => new EventEmitter<T, A>(), finalDeps);
  // const queue = React.useMemo(() => Queue.unbounded<{ data: T }>(), finalDeps);
  // const effect0 = React.useMemo(
  //   () =>
  //     Effect.gen(function* () {
  //       const q = yield* queue;
  //       return Stream.fromQueue(q).pipe(
  //         Stream.tap(Console.log),
  //         Stream.runDrain
  //       );
  //     }),
  //   finalDeps
  // );

  //   queue.pipe(
  //     Effect.andThen(Stream.fromQueue),
  //     Effect.andThen(
  //       Stream.mapEffect(({ data }) => (Effect.isEffect(fn) ? fn : fn(data)))
  //     ),
  //     Effect.fork,
  //     Effect.andThen(Stream.tap(Console.log)),
  //     Stream.runDrain
  //   ),
  //   finalDeps
  // );
  const effect = React.useMemo(
    () =>
      pipe(
        Stream.fromAsyncIterable(createAsyncIterator(emitter), () => {}),
        Stream.mapEffect(({ data, eventId }) => {
          return pipe(
            Effect.sync(() => (Effect.isEffect(fn) ? fn : fn(data))),
            Effect.andThen(Effect.tap(emitter.resolve(eventId)))
          );
        }),
        Stream.runDrain
      ),
    finalDeps
  );

  // useRuntime(
  //   context,
  //   Effect.gen(function* () {
  //     const q = yield* Queue.take(yield* queue);
  //     console.log(q);
  //   }).pipe(Effect.forever),
  // queue.pipe(
  //   Effect.andThen(Queue.take),
  //   Effect.tap(() => Console.log('take')),
  //   Effect.forever
  // ),
  //   finalDeps
  // );

  useRuntime(context, effect, deps);

  // const emitFn = React.useCallback(
  //   (data: T) =>
  //     runtime!.runPromise(queue.pipe(Effect.andThen(Queue.offer({ data })))),
  //   [runtime]
  // );

  // return emitFn as IsUnknown<T> extends true
  //   ? () => Promise<A>
  //   : (value: T) => Promise<A>;

  return emitter.emit as IsUnknown<T> extends true
    ? () => Promise<A>
    : (value: T) => Promise<A>;
}

/*
This hook is used to run an effect in a runtime.
It takes a context and an effect and runs the effect in the runtime provided by the context. It is used by useRuntimeFn. Assumes createRuntimeContext is used to create the context, because it expects a Layer when withRuntime is missing.
*/

const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using WithRuntime?
  `;

type UpcastSubType<T, U> = U extends T ? U : never;

export const useRuntime = <A, E, REffect, RContext>(
  context:
    | ManagedRuntime.ManagedRuntime<RContext, never>
    | RuntimeContext<RContext>,
  effect: Effect.Effect<A, E, UpcastSubType<RContext, REffect>>,
  deps: React.DependencyList = []
) => {
  let runtime = context as React.ContextType<RuntimeContext<RContext>>;
  if (isReactContext<RuntimeContext<RContext>>(context)) {
    runtime = React.useContext(context);
    if (runtime === undefined) throw new Error(noRuntimeMessage);
  }

  React.useEffect(() => {
    const F = runtime!.runFork(effect);
    return () => Effect.runSync(F.pipe(Fiber.interruptAsFork(FiberId.none)));
  }, [runtime, ...deps]);
};

/*
This hook is used to run an effect synchronously in a runtime and return the value of the effect.
It takes a context and an effect and runs the effect in the runtime provided by the context.
*/

export const useRuntimeSync = <A, E, R>(
  context: RuntimeContext<R>,
  effect: Effect.Effect<A, E, NoInfer<R>>,
  deps: React.DependencyList = []
) => {
  const runtime = React.useContext(context);
  if (runtime === undefined) throw new Error(noRuntimeMessage);
  return React.useMemo(() => runtime.runSync(effect), [...deps, runtime]);
};

/* 
This is converting push based events to a pull based stream, 
where the consumer has control through the provided effect.
*/

// TODO: consider if we can use Stream.buffer instead of EventEmitter.

class EventEmitter<T, A> {
  private listeners: Array<(data: T, eventId: string) => void> = [];
  private resolvers: Map<string, (result: A) => void> = new Map();
  private eventQueue: Array<{ data: T; eventId: string }> = [];

  emit = (data: T): Promise<A> => {
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
}

async function* createAsyncIterator<T, A>(
  emitter: EventEmitter<T, A>
): AsyncGenerator<{ data: T; eventId: string }> {
  while (true) {
    yield await emitter.waitForEvent();
  }
}
