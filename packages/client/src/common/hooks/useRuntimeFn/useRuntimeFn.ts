import * as React from 'react';
import { Effect, pipe, Stream, ManagedRuntime, Scope, Exit } from 'effect';
import type { IsUnknown } from 'type-fest';
import { v4 as uuidv4 } from 'uuid';
import type { RuntimeContext } from 'common/utils/context';
import { isReactContext } from 'common/utils/react';

//* It is important to note that the runtime of the host component should always be provided to the dependency array, if runtimes higher up the tree are accessed using useRuntimeFn, useRuntime or useRuntimeSync.

/*
This hook returns a function that can be called to trigger an effect.
It returns a promise that resolves to the value of the effect.
*/

// TODO: consider using useRef to share the stream between instances, because it is agnostic to the effect. However, there are considerations here, because we currently allow for backpressure for each indidivual stream.

export function useRuntimeFn<A, E, R, T>(
  context:
    | RuntimeContext<R>
    | (ManagedRuntime.ManagedRuntime<R, never> & { id: string }),
  fn:
    | ((value: T) => Effect.Effect<A, E, NoInfer<R> | Scope.Scope>)
    | Effect.Effect<A, E, NoInfer<R> | Scope.Scope>,
  deps: React.DependencyList = []
) {
  const fnRef = React.useRef(fn);

  const runtime = ManagedRuntime.isManagedRuntime(context)
    ? context
    : React.use(context as RuntimeContext<R>);
  const finalDeps = [runtime, ...deps];

  React.useEffect(() => {
    fnRef.current = fn;
  }, [finalDeps]);

  const emitter = React.useMemo(() => new EventEmitter<T, A>(), finalDeps);
  const effect = React.useMemo(
    () =>
      Effect.gen(function* () {
        yield* pipe(
          Stream.fromAsyncIterable(createAsyncIterator(emitter), () => {}),
          Stream.mapEffect(({ data, eventId }) => {
            return pipe(
              Effect.isEffect(fnRef.current)
                ? fnRef.current
                : fnRef.current(data),
              Effect.tap(emitter.resolve(eventId))
            );
          }),
          Stream.runDrain
        );
      }),
    finalDeps
  );

  // emitter is added to deps, because it is unstable on fast refresh.
  // We cannot pass fn directly as a dep, because it would recreate a stream on every rerender when it's accidentally unstable (with inline declared effects)
  useRuntime(context, effect, [emitter, ...deps]);

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
    | (ManagedRuntime.ManagedRuntime<RContext, never> & { id: string })
    | RuntimeContext<RContext>,
  effect: Effect.Effect<A, E, UpcastSubType<RContext, REffect> | Scope.Scope>,
  deps: React.DependencyList = []
) => {
  let runtime = context as React.ContextType<RuntimeContext<RContext>>;
  if (isReactContext<RuntimeContext<RContext>>(context)) {
    runtime = React.use(context);
    if (runtime === undefined) throw new Error(noRuntimeMessage);
  }

  React.useEffect(() => {
    const scope = Effect.runSync(Scope.make());
    runtime!.runFork(effect.pipe(Effect.forkScoped, Scope.extend(scope)));
    return () => {
      runtime!.runFork(Scope.close(scope, Exit.void));
    };
  }, [runtime, ...deps]);
};

/*
This hook is used to run an effect synchronously in a runtime and return the value of the effect.
It takes a context and an effect and runs the effect in the runtime provided by the context.
*/

export const useRuntimeSync = <A, E, R>(
  context:
    | RuntimeContext<R>
    | (ManagedRuntime.ManagedRuntime<R, never> & { id: string }),
  effect: Effect.Effect<A, E, NoInfer<R>>,
  deps: React.DependencyList = []
) => {
  const runtime = ManagedRuntime.isManagedRuntime(context)
    ? context
    : React.use(context as RuntimeContext<R>);

  if (runtime === undefined) throw new Error(noRuntimeMessage);
  return React.useMemo(() => runtime.runSync(effect), [...deps, runtime]);
};

/* 
This is converting push based events to a pull based stream, 
where the consumer has control through the provided effect.
*/

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
