import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import type { Simplify, IsAny } from 'type-fest';
import { type RuntimeContext } from 'common/utils/context';
import { type ExtractMeta, getDisplayName } from 'common/utils/react';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

// TODO: think about assigning a method to the function, to obtain the provided react context objects in the hoc as an array, for testing purposes. We can separate the hoc from the pipe function and export the method as a named export.

type Props = {
  readonly children?: React.ReactNode;
};

type InferProps<C> = C extends React.FC<infer P> ? P : never;

type FallbackProps<C, P> =
  IsAny<InferProps<C>> extends false ? InferProps<C> : P;

export function WithRuntime<
  TTarget,
  TProps extends Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  C extends React.FC<any>,
>(
  Context: RuntimeContext<TTarget>,
  getSource: (
    runtime: ManagedRuntime.ManagedRuntime<TTarget, never>,
    props: React.ComponentProps<C>
  ) => TProps
): (
  Component?: C
) => React.FC<Simplify<Omit<FallbackProps<C, Props>, keyof TProps>>> &
  Simplify<ExtractMeta<C>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WithRuntime<TTarget, C extends React.FC<any>>(
  Context: RuntimeContext<TTarget>,
  getSource?: (
    runtime: ManagedRuntime.ManagedRuntime<TTarget, never>,
    props: React.ComponentProps<C>
  ) => void
): (
  Component?: C
) => React.FC<Simplify<FallbackProps<C, Props>>> & Simplify<ExtractMeta<C>>;

//
// the goal is to have a utility that allows us to reuse the logic between the withRuntime hoc and the Runtime component that takes the runtime as a prop. Later on we might want to consider the Runtime component to be used in JSX in more scenarios, but for now it is limited to usage in storybook decorators

export function WithRuntime<
  TTarget,
  TProps extends Record<string, unknown> | undefined,
  P extends TProps,
>(
  Context: RuntimeContext<TTarget>,
  getSource?: (
    runtime: ManagedRuntime.ManagedRuntime<TTarget, never>,
    props: P
  ) => TProps
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <C extends React.FC<any>>(Component?: C) => {
    const Wrapped: React.FC<Simplify<FallbackProps<C, Props>>> = (props) => {
      const { layer } = Context as unknown as {
        layer: Layer.Layer<TTarget>;
      };

      const runtime = useRuntimeFactory(layer);
      const mergedProps = getSource
        ? Object.assign(getSource(runtime, props as P) ?? {}, props)
        : props;

      const children =
        createElement(Component, mergedProps) ??
        (props.children as React.ReactNode) ??
        null;

      return <Context.Provider value={runtime}>{children}</Context.Provider>;
    };
    Wrapped.displayName = getDisplayName(Component, 'WithRuntime');
    const meta = Component ? extractMeta(Component) : {};
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

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>) => {
  const layerRef = React.useRef(layer);
  const shouldCreate = React.useRef(false);
  const [runtime, setRuntime] = React.useState(() =>
    ManagedRuntime.make(layer)
  );

  React.useEffect(() => {
    if (shouldCreate.current || layerRef.current !== layer) {
      const newRuntime = ManagedRuntime.make(layer);
      setRuntime(() => newRuntime);
    }

    return () => {
      void runtime.dispose();
      shouldCreate.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  return runtime;
};
