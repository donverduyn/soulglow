import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import type { RuntimeContext } from 'context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

export function withRuntime<T>(Context: RuntimeContext<T>) {
  return <P extends object>(Component: React.FC<P>) => {
    const Wrapped = (props: P) => {
      const runtimeRef = useRuntimeFactory(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error _currentValue does not exist
        Context._currentValue as unknown as Layer.Layer<T>
      );

      return (
        <Context.Provider value={runtimeRef}>
          <Component
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        </Context.Provider>
      );
    };
    return Wrapped;
  };
}

/*
This hook creates a runtime and disposes it when the component is unmounted.
It is used by withRuntime to create a runtime for the context.
*/

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>) => {
  const ref = React.useRef<ManagedRuntime.ManagedRuntime<T, never> | null>(
    null
  );

  React.useLayoutEffect(() => {
    const runtime = ManagedRuntime.make(layer);
    ref.current = runtime;

    return () => {
      void runtime.dispose();
      ref.current = null;
    };
  }, [layer]);
  return ref;
};

// TODO: breaks fast refresh. Should be in a separate file?
export const createRuntimeContext = <T,>(layer: Layer.Layer<T>) => {
  return React.createContext<
    React.MutableRefObject<ManagedRuntime.ManagedRuntime<T, never> | null>
    // we abuse context here to pass through the layer
  >(layer as unknown as React.MutableRefObject<null>);
};
