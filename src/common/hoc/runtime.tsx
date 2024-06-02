import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';

const useEffectRuntime = <T,>(layer: Layer.Layer<T>) => {
  const ref = React.useRef<ManagedRuntime.ManagedRuntime<T, never> | null>(
    null
  );

  React.useLayoutEffect(() => {
    const id = Math.round(Math.random() * 1000);
    console.log(`[useEffectRuntime] create runtime ${String(id)}`);

    const runtime = ManagedRuntime.make(layer);
    ref.current = runtime;

    return () => {
      void runtime.dispose();
      console.log(`[useEffectRuntime] dispose runtime ${String(id)}`);
    };
  }, [layer]);
  return ref;
};

export const createRuntimeContext = <T,>(layer: Layer.Layer<T>) => {
  const factory = () => ManagedRuntime.make(layer);

  return React.createContext<
    React.MutableRefObject<Awaited<ReturnType<typeof factory>> | null>
    // we abuse context here to pass through the layer
    // while casting context to the inferred type of the runtime
  >(layer as unknown as React.MutableRefObject<null>);
};

export const runtime = <T,>(Context: React.Context<T>) => {
  return <P extends object>(Component: React.FC<P>): React.FC<P> => {
    const Wrapped = (props: P) => {
      const runtimeRef = useEffectRuntime(
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
    return Wrapped;
  };
};
