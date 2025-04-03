/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
  Effect,
  pipe,
  Stream,
  Scope,
  Exit,
  Layer,
  ManagedRuntime,
} from 'effect';
import memoize from 'moize';
import type { Simplify, IsAny, IsUnknown } from 'type-fest';
import { v4 as uuid, v4 as uuidv4 } from 'uuid';
import { RuntimeContext, RuntimeInstance } from 'common/utils/context';
import { type ExtractMeta, getDisplayName } from 'common/utils/react';
import { copyStaticProperties, isReactContext } from 'common/utils/react';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

type Props = {
  readonly children?: React.ReactNode;
};

type Config = {
  componentName: string;
  debug: boolean;
  factory: <T>(layer: Layer.Layer<T>, id: string) => RuntimeInstance<T> | null;
  postUnmountTTL: number;
};

type RuntimeApi<R> = {
  runtime: RuntimeInstance<R>;
  use: ReturnType<typeof createUse<R>>;
  useFn: ReturnType<typeof createFn<R>>;
  useRun: ReturnType<typeof createRun<R>>;
};

type InferProps<C> = C extends React.FC<infer P> ? P : never;

type FallbackProps<C, P> =
  IsAny<InferProps<C>> extends false ? InferProps<C> : P;

type Fallback<T, U> = [T, U] extends [infer A, infer B]
  ? unknown extends A
    ? B
    : A
  : never;

const UPSTREAM_KEY = '__runtimes';

export const WithUpstream =
  <R,>(Context: RuntimeContext<R>) =>
  <C extends React.FC<any>>(Component: C): C => {
    const { layer } = Context as unknown as {
      layer: Layer.Layer<R>;
    };

    const meta = extractMeta(Component);
    const existing = (meta[UPSTREAM_KEY as keyof typeof meta] ??
      []) as RuntimeContext<any>[];
    const base = Object.assign({}, meta, {
      [UPSTREAM_KEY]: existing.concat(Context),
    });

    const Wrapper = (
      props: React.ComponentProps<C> & {
        readonly __render: (cmp: C) => React.ElementType | null;
      }
    ) => {
      const { __render, ...rest } = props;
      const finalRender = (__render ?? (() => null)) as (
        cmp: C,
        props: React.ComponentProps<C>
      ) => React.ReactNode | null;

      const upstream = React.use(Context);
      const config: Config = {
        componentName: getDisplayName(Component, 'WithUpStream'),
        debug: false,
        factory: upstream
          ? () => null
          : (layer, id) => Object.assign(ManagedRuntime.make(layer), { id }),
        postUnmountTTL: 1000,
      };

      // we always create a new runtime, but use an inert factory to prevent instantiation
      // because we can't guarantee the number of hook calls otherwise.
      const runtime = useRuntimeInstance(layer, config);
      const Result = finalRender(Component, props);

      return upstream ? (
        (Result ?? <Component {...(rest as React.ComponentProps<C>)} />)
      ) : (
        // this is the fallback for testing/storybook
        <Context.Provider value={runtime!}>
          {Result ?? <Component {...(rest as React.ComponentProps<C>)} />}
        </Context.Provider>
      );
    };

    copyStaticProperties(base, Wrapper);
    Wrapper.displayName = getDisplayName(Component, 'WithUpstream');
    return Wrapper as C;
  };

export function WithRuntime<TTarget, TProps, C extends React.FC<any>>(
  Context: RuntimeContext<TTarget>,
  getSource: (
    runtimeFactory: (config?: Partial<Config>) => RuntimeApi<TTarget>,
    props: Simplify<Partial<React.ComponentProps<C>>>
  ) => TProps
  // fn: (props: Simplify<Omit<FallbackProps<C, Props>, keyof TProps>>) => void
): (
  Component?: C
) => React.FC<Simplify<Omit<FallbackProps<C, Props>, keyof TProps>>> &
  Simplify<ExtractMeta<C>>;

export function WithRuntime<TTarget, C extends React.FC<any>>(
  Context: RuntimeContext<TTarget>,
  getSource?: (
    runtimeFactory: (config?: Partial<Config>) => RuntimeApi<TTarget>,
    props: Simplify<Partial<React.ComponentProps<C>>>
  ) => void
): (
  Component?: C
) => React.FC<Simplify<FallbackProps<C, Props>>> & Simplify<ExtractMeta<C>>;

//
// the goal is to have a utility that allows us to reuse the logic between the withRuntime hoc and the Runtime component that takes the runtime as a prop. Later on we might want to consider the Runtime component to be used in JSX in more scenarios, but for now it is limited to usage in storybook decorators

export function WithRuntime<
  C extends React.FC<any>,
  TTarget,
  TProps extends Record<string, unknown> | undefined,
>(
  Context: RuntimeContext<TTarget>,
  getSource?: (
    runtimeFactory: (config?: Partial<Config>) => RuntimeApi<TTarget>,
    props: Partial<FallbackProps<C, Props>>
  ) => TProps
) {
  return (Component?: C & { __runtimes?: RuntimeContext<any>[] }) => {
    const Wrapper: React.FC<Partial<FallbackProps<C, Props>>> = (props) => {
      // const contexts = Component?.__runtimes ?? [];
      const withUpstreamCtx = Component?.__runtimes !== undefined;
      const { layer } = Context as unknown as {
        layer: Layer.Layer<TTarget>;
      };

      const createSource = React.useCallback(() => {
        let runtimeRef = null as RuntimeInstance<TTarget> | null;
        let upstreamRef = null as RuntimeInstance<TTarget> | null;
        const config: Config = {
          componentName: getDisplayName(Component, 'WithRuntime'),
          debug: false,
          factory: (layer, id) =>
            Object.assign(ManagedRuntime.make(layer), {
              id,
            }),
          postUnmountTTL: 1000,
        };

        const source = getSource
          ? getSource((overrides) => {
              const safeConfig = Object.assign(config, overrides ?? {});
              const upstream = React.use(Context);

              // eslint-disable-next-line react-hooks/rules-of-hooks
              const runtime = upstream ?? useRuntimeInstance(layer, safeConfig);
              runtimeRef = upstream ?? runtime;
              upstreamRef = upstream ?? null;
              return {
                runtime: upstream ?? runtime!,
                use: createUse(Context, runtime!),
                useFn: createFn(Context, runtime!),
                useRun: createRun(Context, runtime!),
              };
            }, props)
          : undefined;

        if (!getSource || runtimeRef === null) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          runtimeRef = useRuntimeInstance(layer, config);
        }

        return [source ?? {}, runtimeRef, upstreamRef !== null] as const;
      }, [layer, props]);

      const [source, runtime, hasUpstreamInstance] = createSource();

      // this allows context injection when withUpstreamCtx is true
      const __render = React.useCallback(
        (Previous: C, props: React.ComponentProps<C>) => {
          // nothing to inject from withRuntime
          if (hasUpstreamInstance) return <Previous {...props} />;
          return (
            <Context.Provider value={runtime!}>
              <Previous {...props} />
            </Context.Provider>
          );
        },
        [hasUpstreamInstance, runtime]
      );

      const mergedProps = getSource
        ? Object.assign(source, props, { __render })
        : Object.assign({}, props, { __render });

      const children =
        createElement(Component, mergedProps) ??
        (props.children as React.ReactNode) ??
        null;

      // we already render the context inside the __render function
      // whenever withUpstreamCtx is true
      if (withUpstreamCtx) return children;
      if (hasUpstreamInstance) return children;
      return <Context.Provider value={runtime!}>{children}</Context.Provider>;
    };
    const meta = Component ? extractMeta(Component) : {};
    const MemoWrapper = React.memo(Wrapper);
    MemoWrapper.displayName = getDisplayName(Component, 'WithRuntime');
    copyStaticProperties(meta, MemoWrapper);
    return MemoWrapper;
  };
}

const createElement = <C extends React.FC<any> | undefined>(
  Component: C,

  mergedProps: C extends React.FC<any>
    ? React.ComponentProps<C>
    : Record<never, never>
) => (Component ? <Component {...mergedProps} /> : null);

const extractMeta = <C extends React.FC<any>>(Component: C) =>
  Object.getOwnPropertyNames(Component)
    .filter(
      (() => {
        const skip = Object.getOwnPropertyNames(() => {});
        return (key) => !skip.includes(key);
      })()
    )
    .reduce(
      (acc, key) => Object.assign(acc, { [key]: Component[key as keyof C] }),
      {} as ExtractMeta<C>
    );

/*
This hook creates a runtime and disposes it when the component is unmounted.
It is used by withRuntime to create a runtime for the context. 
This is both compatible with strict mode and fast refresh. 🚀
*/

const printLog = (config: Config, message: string) => {
  if (!config.debug) return;
  console.log(`[${config.componentName}] ${message}`);
};

const createRuntime = memoize(
  <T,>(layer: Layer.Layer<T>, runtimeId: string, config: Config) => {
    printLog(config, `creating runtime ${runtimeId}`);
    const instance = config.factory(layer, runtimeId);
    return instance
      ? (Object.assign(instance, { id: runtimeId }) as RuntimeInstance<T>)
      : null;
  },
  // this prevents a second instantiation in strict mode inside the useState function, which gets disposed immediately, and it since it has no side effects, we are safe.
  { isShallowEqual: true, maxAge: 100, maxArgs: 2 }
);

const useRuntimeInstance = <T,>(layer: Layer.Layer<T>, config: Config) => {
  // TODO: use useSyncExternalStore to keep track of runtime instances and dispose them based on postUnmountTTL. Rehydrate the runtime instances on mount (maybe we need a component name/id combo here)

  const layerRef = React.useRef(layer);
  const shouldCreate = React.useRef(false);
  const runtimeId = React.useRef(uuid());
  const hasMounted = React.useRef(false);

  const [runtime, setRuntime] = React.useState(() =>
    createRuntime(layerRef.current, runtimeId.current, config)
  );

  if (!hasMounted.current) {
    hasMounted.current = true;
  } else {
    printLog(config, `reusing runtime  ${runtimeId.current}`);
  }

  React.useEffect(() => {
    if (shouldCreate.current || layerRef.current !== layer) {
      layerRef.current = layer;
      runtimeId.current = uuid();
      shouldCreate.current = false;
      printLog(config, `recreating runtime ${runtimeId.current}`);
      const newRuntime = Object.assign(ManagedRuntime.make(layer), {
        id: runtimeId.current,
      });
      setRuntime(() => newRuntime);
    }

    return () => {
      printLog(config, `disposing runtime ${runtimeId.current}`);
      setTimeout(() => runtime && void runtime.dispose(), 0);
      shouldCreate.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  return runtime;
};

/*
This hook returns a function that can be called to trigger an effect.
It returns a promise that resolves to the value of the effect.
*/

type InvalidShapes =
  | React.ProviderProps<any>
  | React.Context<any>
  | { Provider: unknown }
  | undefined;

type Sanitize<T> = T extends InvalidShapes ? unknown : T;

const getDeps = (input: any, deps: React.DependencyList) =>
  (Effect.isEffect(input)
    ? deps
    : Array.isArray(input)
      ? input
      : deps) as React.DependencyList;

const getRuntime = <R, R1>(input: any, localContext: any, localRuntime: any) =>
  (isReactContext<RuntimeContext<R1>>(input)
    ? input !== localContext
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        React.use(input)
      : localRuntime
    : ManagedRuntime.isManagedRuntime(input)
      ? input
      : localRuntime) as RuntimeInstance<R | R1>;

const getEffectFn = <T,>(input: any, fnOrDeps: any) =>
  (!ManagedRuntime.isManagedRuntime(input) &&
  !Effect.isEffect(input) &&
  !isReactContext(input)
    ? input
    : typeof fnOrDeps === 'function'
      ? fnOrDeps
      : undefined) as T;

const getEffect = <T,>(input: any, effectOrDeps: any) =>
  (Effect.isEffect(input) && !ManagedRuntime.isManagedRuntime(input)
    ? input
    : Effect.isEffect(effectOrDeps)
      ? effectOrDeps
      : Effect.void) as T;

const createFn =
  <R,>(localContext: RuntimeContext<R>, localRuntime: RuntimeInstance<R>) =>
  <T, T1, A, A1, E, E1, R1>(
    targetOrEffect:
      | RuntimeInstance<R1>
      | RuntimeContext<R1>
      | ((value: T) => Effect.Effect<A, E, R | Scope.Scope>),
    fnOrDeps?:
      | ((value: T1) => Effect.Effect<A1, E1, Fallback<R1, R> | Scope.Scope>)
      | React.DependencyList,
    deps: React.DependencyList = []
  ) => {
    const finalDeps = getDeps(fnOrDeps, deps);
    const effectFn = getEffectFn<
      (value: Sanitize<T> | T1) => Effect.Effect<A | A1, E | E1, R | R1>
    >(targetOrEffect, fnOrDeps);

    const runtime = getRuntime<R, R1>(
      targetOrEffect,
      localContext,
      localRuntime
    );
    const fnRef = React.useRef(effectFn);

    React.useEffect(() => {
      fnRef.current = effectFn;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localRuntime, runtime, ...finalDeps]);

    const emitter = React.useMemo(
      () => new EventEmitter<Sanitize<T> | T1, A | A1>(),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [localRuntime, runtime, ...finalDeps]
    );
    const stream = React.useMemo(
      () =>
        pipe(
          Stream.fromAsyncIterable(createAsyncIterator(emitter), () => {}),
          Stream.mapEffect(({ data, eventId }) =>
            pipe(
              fnRef.current(data),
              Effect.tap((v) => emitter.resolve(eventId)(v))
            )
          ),
          Stream.runDrain
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [localRuntime, runtime, ...finalDeps]
    );

    React.useEffect(() => {
      const scope = Effect.runSync(Scope.make());
      if (runtime)
        runtime.runFork(stream.pipe(Effect.forkScoped, Scope.extend(scope)));
      return () => {
        if (runtime) runtime.runFork(Scope.close(scope, Exit.void));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localRuntime, runtime, emitter, ...finalDeps]);

    return emitter.emit as IsUnknown<Fallback<T1, Sanitize<T>>> extends true
      ? () => Promise<Fallback<A1, A>>
      : (value: Fallback<T1, Sanitize<T>>) => Promise<Fallback<A1, A>>;
  };

/*
This hook is used to run an effect in a runtime.
It takes a context and an effect and runs the effect in the runtime provided by the context. It is used by useRuntimeFn. Assumes createRuntimeContext is used to create the context, because it expects a Layer when withRuntime is missing.
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using WithRuntime?
  `;

const createRun =
  <R,>(localContext: RuntimeContext<R>, localRuntime: RuntimeInstance<R>) =>
  <A, E, R1>(
    targetOrEffect:
      | RuntimeInstance<R1>
      | RuntimeContext<R1>
      | Effect.Effect<A, E, R | Scope.Scope>,
    effectOrDeps?:
      | Effect.Effect<A, E, Fallback<R1, R> | Scope.Scope>
      | React.DependencyList,
    deps: React.DependencyList = []
  ) => {
    const finalDeps = getDeps(effectOrDeps, deps);
    const effect = getEffect<Effect.Effect<A, E, R | R1>>(
      targetOrEffect,
      effectOrDeps
    );
    const runtime = getRuntime<R, R1>(
      targetOrEffect,
      localContext,
      localRuntime
    );

    React.useEffect(() => {
      const scope = Effect.runSync(Scope.make());
      runtime.runFork(effect.pipe(Effect.forkScoped, Scope.extend(scope)));
      return () => {
        runtime.runFork(Scope.close(scope, Exit.void));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localRuntime, runtime, ...finalDeps]);
  };

const createUse =
  <R,>(localContext: RuntimeContext<R>, localRuntime: RuntimeInstance<R>) =>
  <A, E, R1>(
    targetOrEffect:
      | RuntimeInstance<R1>
      | RuntimeContext<R1>
      | Effect.Effect<A, E, R>,
    effectOrDeps?: Effect.Effect<A, E, Fallback<R1, R>> | React.DependencyList,
    deps: React.DependencyList = []
  ) => {
    const finalDeps = getDeps(effectOrDeps, deps);
    const effect = getEffect<Effect.Effect<A, E, R | R1>>(
      targetOrEffect,
      effectOrDeps
    );
    const runtime = getRuntime<R, R1>(
      targetOrEffect,
      localContext,
      localRuntime
    );
    return React.useMemo(
      () => runtime.runSync(effect),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [localRuntime, runtime, ...finalDeps]
    );
  };

// const createMergeFn = () => {}
// const createExhaustFn = () => {}
// const createSwitchFn = () => {}

/* eslint-enable @typescript-eslint/no-explicit-any */

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
