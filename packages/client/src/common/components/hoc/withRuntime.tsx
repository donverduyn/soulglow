import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import memoize from 'moize';
import type { Simplify, IsAny } from 'type-fest';
import { v4 as uuid } from 'uuid';
import {
  useRuntime,
  useRuntimeFn,
  useRuntimeSync,
} from 'common/hooks/useRuntimeFn/useRuntimeFn';
import { type RuntimeContext } from 'common/utils/context';
import { type ExtractMeta, getDisplayName } from 'common/utils/react';
import { copyStaticProperties } from 'common/utils/react';

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
  postUnmountTTL: number;
  shared: boolean;
};

type RuntimeObject<TRuntime, TUse, TFn, TRun> = {
  fn: TFn;
  run: TRun;
  runtime: TRuntime;
  use: TUse;
};

type InferProps<C> = C extends React.FC<infer P> ? P : never;

type FallbackProps<C, P> =
  IsAny<InferProps<C>> extends false ? InferProps<C> : P;

export function WithRuntime<
  TTarget,
  TProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends React.FC<any>,
>(
  Context: RuntimeContext<TTarget>,
  getSource: (
    runtimeFactory: (
      config?: Partial<Config>
    ) => RuntimeObject<
      ManagedRuntime.ManagedRuntime<TTarget, never> & { id: string },
      ReturnType<typeof useRuntimeSync<TTarget>>,
      ReturnType<typeof useRuntimeFn<TTarget>>,
      ReturnType<typeof useRuntime<TTarget>>
    >,
    props: Simplify<Partial<React.ComponentProps<C>>>
  ) => TProps
  // fn: (props: Simplify<Omit<FallbackProps<C, Props>, keyof TProps>>) => void
): (
  Component?: C
) => React.FC<Simplify<Omit<FallbackProps<C, Props>, keyof TProps>>> &
  Simplify<ExtractMeta<C>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WithRuntime<TTarget, C extends React.FC<any>>(
  Context: RuntimeContext<TTarget>,
  getSource?: (
    runtimeFactory: (
      config?: Partial<Config>
    ) => RuntimeObject<
      ManagedRuntime.ManagedRuntime<TTarget, never> & { id: string },
      ReturnType<typeof useRuntimeSync<TTarget>>,
      ReturnType<typeof useRuntimeFn<TTarget>>,
      ReturnType<typeof useRuntime<TTarget>>
    >,
    props: Simplify<Partial<React.ComponentProps<C>>>
  ) => void
): (
  Component?: C
) => React.FC<Simplify<FallbackProps<C, Props>>> & Simplify<ExtractMeta<C>>;

//
// the goal is to have a utility that allows us to reuse the logic between the withRuntime hoc and the Runtime component that takes the runtime as a prop. Later on we might want to consider the Runtime component to be used in JSX in more scenarios, but for now it is limited to usage in storybook decorators

export function WithRuntime<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends React.FC<any>,
  TTarget,
  TProps extends Record<string, unknown> | undefined,
>(
  Context: RuntimeContext<TTarget>,
  getSource?: (
    runtimeFactory: (
      config?: Partial<Config>
    ) => RuntimeObject<
      ManagedRuntime.ManagedRuntime<TTarget, never> & { id: string },
      ReturnType<typeof useRuntimeSync<TTarget>>,
      ReturnType<typeof useRuntimeFn<TTarget>>,
      ReturnType<typeof useRuntime<TTarget>>
    >,
    props: Partial<FallbackProps<C, Props>>
  ) => TProps
) {
  return (Component?: C) => {
    const Wrapped: React.FC<Partial<FallbackProps<C, Props>>> = (props) => {
      const { layer } = Context as unknown as {
        layer: Layer.Layer<TTarget>;
      };

      const createSource = React.useCallback(() => {
        const config: Config = {
          componentName: getDisplayName(Component, 'WithRuntime'),
          debug: false,
          postUnmountTTL: 1000,
          shared: false,
        };
        let runtimeRef = null as
          | (ManagedRuntime.ManagedRuntime<TTarget, never> & { id: string })
          | null;

        const source = getSource
          ? getSource((overrides) => {
              const safeConfig = Object.assign(config, overrides ?? {});
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const runtime = useRuntimeFactory(layer, safeConfig);
              runtimeRef = runtime;
              return {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                fn: useRuntimeFn(Context, runtime),
                // eslint-disable-next-line react-hooks/rules-of-hooks
                run: useRuntime(Context, runtime),
                runtime,
                // eslint-disable-next-line react-hooks/rules-of-hooks
                use: useRuntimeSync(Context, runtime),
              };
            }, props)
          : undefined;

        if (!getSource || runtimeRef === null) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          runtimeRef = useRuntimeFactory(layer, config);
        }

        return [source ?? {}, runtimeRef] as const;
      }, [layer, props]);

      const [source, runtime] = createSource();
      const mergedProps = getSource ? Object.assign(source, props) : props;
      const children =
        createElement(Component, mergedProps) ??
        (props.children as React.ReactNode) ??
        null;

      return <Context.Provider value={runtime}>{children}</Context.Provider>;
    };
    Wrapped.displayName = getDisplayName(Component, 'WithRuntime');
    const meta = Component ? extractMeta(Component) : {};
    copyStaticProperties(meta, Wrapped as unknown as Record<string, unknown>);
    return Object.assign(Wrapped, meta);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createElement = <C extends React.FC<any> | undefined>(
  Component: C,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergedProps: C extends React.FC<any>
    ? React.ComponentProps<C>
    : Record<never, never>
) => (Component ? <Component {...mergedProps} /> : null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    return Object.assign(ManagedRuntime.make(layer), {
      id: runtimeId,
    }) as ManagedRuntime.ManagedRuntime<T, never> & { id: string };
  },
  // this prevents a second instantiation in strict mode inside the useEffect function, which gets disposed immediately, and it since it has no side effects, we are safe.
  { isShallowEqual: true, maxAge: 100, maxArgs: 2 }
);

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>, config: Config) => {
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
    // printLog(config, `useEffect ${runtimeId.current}`);
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
      // console.log(runtime)
      setTimeout(() => {
        void runtime.dispose();
      }, 0);
      shouldCreate.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  return runtime;
};
