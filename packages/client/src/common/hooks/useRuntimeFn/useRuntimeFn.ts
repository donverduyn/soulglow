import * as React from 'react';
import {
  Effect,
  pipe,
  Stream,
  ManagedRuntime,
  Scope,
  Exit,
  type Runtime,
} from 'effect';
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

export const useRuntimeFn =
  <R>(
    context: RuntimeContext<R>,
    runtime: ManagedRuntime.ManagedRuntime<R, never> & { id: string }
  ) =>
  <A, A1, E, E1, R1, T, T1>(
    targetOrEffect:
      | ((value: T) => Effect.Effect<A, E, NoInfer<R> | Scope.Scope>)
      | RuntimeContext<R1>
      | (ManagedRuntime.ManagedRuntime<R1, never> & { id: string }),
    depsOrFn?:
      | ((value: T1) => Effect.Effect<A1, E1, NoInfer<R1> | Scope.Scope>)
      | React.DependencyList,
    deps?: React.DependencyList
  ) => {
    const rnt = ManagedRuntime.isManagedRuntime(targetOrEffect)
      ? (targetOrEffect as ManagedRuntime.ManagedRuntime<R1, never> & {
          id: string;
        })
      : isReactContext(targetOrEffect)
        ? targetOrEffect === context
          ? runtime
          : React.use(targetOrEffect as unknown as RuntimeContext<R1>)
        : typeof targetOrEffect === 'function'
          ? runtime
          : undefined;

    if (rnt === undefined) throw new Error(noRuntimeMessage);

    const effectFactory =
      !ManagedRuntime.isManagedRuntime(targetOrEffect) &&
      !isReactContext(targetOrEffect)
        ? (targetOrEffect as (value: T) => Effect.Effect<A, E, R | Scope.Scope>)
        : !Effect.isEffect(depsOrFn) && typeof depsOrFn === 'function'
          ? depsOrFn
          : undefined;

    if (effectFactory === undefined) throw new Error(noEffectMessage);

    const finalDeps = [
      runtime,
      ...((typeof depsOrFn === 'function' ? deps : depsOrFn) ?? []),
    ];

    const obtainFn = React.useCallback(() => {
      return !ManagedRuntime.isManagedRuntime(targetOrEffect) &&
        !Effect.isEffect(targetOrEffect) &&
        !isReactContext(targetOrEffect)
        ? targetOrEffect
        : typeof depsOrFn === 'function'
          ? depsOrFn
          : undefined;
    }, []);

    const fnRef = React.useRef(obtainFn());

    React.useEffect(() => {
      fnRef.current = obtainFn();
    }, [finalDeps]);

    const emitter = React.useMemo(
      () => new EventEmitter<T1, A | A1>(),
      finalDeps
    );
    const stream = React.useMemo(
      () =>
        pipe(
          Stream.fromAsyncIterable(createAsyncIterator(emitter), () => {}),
          Stream.mapEffect(({ data, eventId }) =>
            pipe(
              fnRef.current!(data),
              Effect.tap((v) => emitter.resolve(eventId)(v))
            )
          ),
          Stream.runDrain
        ),
      finalDeps
    );

    React.useEffect(() => {
      const scope = Effect.runSync(Scope.make());

      rnt.runFork(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stream as Effect.Effect<any, any, any>).pipe(
          Effect.forkScoped,
          Scope.extend(scope)
        )
      );
      return () => {
        rnt.runFork(Scope.close(scope, Exit.void));
      };
      // emitter is added to deps, because it is unstable on fast refresh.
      // We cannot pass fn directly as a dep, because it would recreate a stream on every rerender when it's accidentally unstable (with inline declared effects)
    }, [runtime, rnt, emitter, ...finalDeps]);

    return emitter.emit as IsUnknown<T> extends true
      ? () => Promise<A1>
      : (value: T1) => Promise<A1>;
  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UseRuntimeFnResult<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Effect.Effect<infer A, any, any>
    ? IsUnknown<A> extends true
      ? never
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        A extends Runtime.Runtime<any>
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any
        : A
    : never;

/*
This hook is used to run an effect in a runtime.
It takes a context and an effect and runs the effect in the runtime provided by the context. It is used by useRuntimeFn. Assumes createRuntimeContext is used to create the context, because it expects a Layer when withRuntime is missing.
*/

const noEffectMessage = `No effect provided.`;

const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using WithRuntime?
  `;

export const useRuntime =
  <R>(
    context: RuntimeContext<R>,
    runtime: ManagedRuntime.ManagedRuntime<R, never> & { id: string }
  ) =>
  <A, A1, E, E1, R1>(
    targetOrEffect:
      | Effect.Effect<A, E, R | Scope.Scope>
      | (ManagedRuntime.ManagedRuntime<R1, never> & { id: string })
      | RuntimeContext<R1>,
    depsOrEffect?:
      | React.DependencyList
      | Effect.Effect<A1, E1, R1 | Scope.Scope>,
    deps?: React.DependencyList
  ) => {
    const rnt = ManagedRuntime.isManagedRuntime(targetOrEffect)
      ? (targetOrEffect as ManagedRuntime.ManagedRuntime<R1, never> & {
          id: string;
        })
      : Effect.isEffect(targetOrEffect)
        ? runtime
        : isReactContext(targetOrEffect)
          ? targetOrEffect === context
            ? runtime
            : React.use(targetOrEffect)
          : undefined;

    if (rnt === undefined) throw new Error(noRuntimeMessage);

    const effect =
      !ManagedRuntime.isManagedRuntime(targetOrEffect) &&
      !isReactContext(targetOrEffect)
        ? (targetOrEffect as Effect.Effect<A, E, R | Scope.Scope>)
        : Effect.isEffect(depsOrEffect)
          ? depsOrEffect
          : undefined;

    if (effect === undefined) throw new Error(noEffectMessage);

    const finalDeps =
      (Effect.isEffect(depsOrEffect) ? deps : depsOrEffect) ?? [];

    React.useEffect(() => {
      const scope = Effect.runSync(Scope.make());
      rnt.runFork(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (effect as Effect.Effect<any, any, any>).pipe(
          Effect.forkScoped,
          Scope.extend(scope)
        )
      );
      return () => {
        rnt.runFork(Scope.close(scope, Exit.void));
      };
    }, [runtime, rnt, ...finalDeps]);
  };

/*
This hook is used to run an effect synchronously in a runtime and return the value of the effect.
It takes a context and an effect and runs the effect in the runtime provided by the context.
*/

export function useRuntimeSync<R>(
  context: RuntimeContext<R>,
  runtime: ManagedRuntime.ManagedRuntime<R, never>
) {
  // rationale:
  // targetOrEffect -> context, runtime or effect
  // depsOrEffect -> dependency list or effect (when targetOrEffect is not an effect)
  // deps -> dependency list (when depsOrEffect is an effect)
  return <A, A1, E, E1, R1>(
    targetOrEffect:
      | Effect.Effect<A, E, R>
      | RuntimeContext<R1>
      | (ManagedRuntime.ManagedRuntime<R1, never> & { id: string }),
    depsOrEffect?: React.DependencyList | Effect.Effect<A1, E1, R1>,
    deps?: React.DependencyList
  ) => {
    const rnt = ManagedRuntime.isManagedRuntime(targetOrEffect)
      ? (targetOrEffect as ManagedRuntime.ManagedRuntime<R1, never> & {
          id: string;
        })
      : Effect.isEffect(targetOrEffect)
        ? runtime
        : isReactContext(targetOrEffect)
          ? targetOrEffect === context
            ? runtime
            : React.use(targetOrEffect)
          : undefined;

    const effect =
      !ManagedRuntime.isManagedRuntime(targetOrEffect) &&
      !isReactContext(targetOrEffect)
        ? (targetOrEffect as Effect.Effect<A, E, R>)
        : Effect.isEffect(depsOrEffect)
          ? depsOrEffect
          : undefined;

    const finalDeps =
      (Effect.isEffect(depsOrEffect) ? deps : depsOrEffect) ?? [];

    if (rnt === undefined) throw new Error(noRuntimeMessage);
    if (effect === undefined) throw new Error(noEffectMessage);
    return React.useMemo(
      () =>
        rnt.runSync(
          effect as Effect.Effect<A, E, R> & Effect.Effect<A, E, R1>
        ) as UseRuntimeSyncResult<typeof effect>,
      [...finalDeps, runtime, rnt]
    );
  };
}

type UseRuntimeSyncResult<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Effect.Effect<infer A, any, any>
    ? IsUnknown<A> extends true
      ? never
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        A extends Runtime.Runtime<any>
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any
        : A
    : never;

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
