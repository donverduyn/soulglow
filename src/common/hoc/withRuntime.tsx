import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import type { RuntimeContext } from 'context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

export function WithRuntime<T>(Context: RuntimeContext<T>) {
  return <P extends object>(Component: React.FC<P>) => {
    const Wrapped = (props: P) => {
      const layer = React.useContext(Context) as unknown as Layer.Layer<T>;
      const runtimeRef = useRuntimeFactory(layer);

      return (
        <Context.Provider value={runtimeRef}>
          <Component
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        </Context.Provider>
      );
    };
    Wrapped.displayName = `WithRuntime`;
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
    if (ref.current === null) {
      console.log('Creating runtime');
      const runtime = ManagedRuntime.make(layer);
      ref.current = runtime;
    }

    return () => {
      if (ref.current) {
        console.log('Disposing runtime');
        void ref.current.dispose();
        ref.current = null;
      }
    };
  }, [layer]);
  return ref;
};
