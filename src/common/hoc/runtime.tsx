import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';

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

// TODO: breaks fast refresh. Should be in a separate file
export const createRuntimeContext = <T,>(layer: Layer.Layer<T>) => {
  const factory = () => ManagedRuntime.make(layer);

  return React.createContext<
    React.MutableRefObject<ReturnType<typeof factory> | null>
    // we abuse context here to pass through the layer
    // while casting context to the inferred type of the runtime
  >(layer as unknown as React.MutableRefObject<null>);
};

export const runtime = <T,>(Context: React.Context<T>) => {
  return <P extends object>(
    Component: React.FC<P>
  ): React.FC<React.PropsWithRef<P>> => {
    const Wrapped = (props: P) => {
      const runtimeRef = useRuntimeFactory(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error _currentValue does not exist
        Context._currentValue as unknown as Layer.Layer<unknown>
      ) as T;

      return (
        <Context.Provider value={runtimeRef}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...props} />
        </Context.Provider>
      );
    };
    return React.memo(Wrapped);
  };
};
