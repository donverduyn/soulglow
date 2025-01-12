import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import type { Simplify } from 'type-fest';
import { type RuntimeContext } from 'common/utils/context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

// TODO: think about assigning a method to the function, to obtain the provided react context objects in the hoc as an array, for testing purposes. We can separate the hoc from the pipe function and export the method as a named export.

export const WithRuntime =
  <TTarget, TProps extends Record<string, unknown>>(
    Context: RuntimeContext<TTarget>,
    getSource?: (
      runtime: ManagedRuntime.ManagedRuntime<TTarget, never>
    ) => TProps
  ) =>
  <P,>(Component: React.FC<P>) => {
    //
    const Wrapped: React.FC<Simplify<Omit<P, keyof TProps>>> = (props) => {
      const { layer } = Context as unknown as {
        layer: Layer.Layer<TTarget>;
      };

      const runtime = useRuntimeFactory(layer);
      const mergedProps = getSource
        ? { ...getSource(runtime), ...props }
        : props;

      return (
        <Context.Provider value={runtime}>
          <Component {...(mergedProps as React.JSX.IntrinsicAttributes & P)} />
        </Context.Provider>
      );
    };
    Wrapped.displayName = `WithRuntime(${Component.displayName || Component.name || 'Component'})`;

    return Wrapped;
  };

/*
This hook creates a runtime and disposes it when the component is unmounted.
It is used by withRuntime to create a runtime for the context. 
This is both compatible with strict mode and fast refresh. 🚀
*/

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>) => {
  const disposed = React.useRef(false);
  const [runtime, setRuntime] = React.useState(() =>
    ManagedRuntime.make(layer)
  );

  React.useEffect(() => {
    let current = runtime;
    if (disposed.current) {
      current = ManagedRuntime.make(layer);
      setRuntime(() => current);
      disposed.current = false;
    }

    return () => {
      void current.dispose();
      disposed.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  return runtime;
};
