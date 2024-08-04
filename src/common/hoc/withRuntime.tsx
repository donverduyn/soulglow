import * as React from 'react';
import { Layer, ManagedRuntime } from 'effect';
import type { RuntimeContext } from 'common/utils/context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

export function WithRuntime<T>(Context: RuntimeContext<T>, label?: string) {
  return <P extends object>(Component: React.FC<P>) => {
    const Wrapped = (props: P) => {
      const layer = React.useContext(Context) as unknown as Layer.Layer<T>;
      const runtime = useRuntimeFactory(layer, label);

      return (
        <Context.Provider value={runtime}>
          <Component {...props} />
        </Context.Provider>
      );
    };
    Wrapped.displayName = `WithRuntime`;
    return React.memo(Wrapped);
  };
}

/*
This hook creates a runtime and disposes it when the component is unmounted.
It is used by withRuntime to create a runtime for the context.
*/

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>, label?: string) => {
  const disposed = React.useRef(false);
  const [runtime, setRuntime] = React.useState(() =>
    ManagedRuntime.make(layer)
  );

  React.useEffect(() => {
    if (disposed.current) {
      setRuntime(() => ManagedRuntime.make(layer));
      disposed.current = false;
    }

    return () => {
      void runtime.dispose();
      disposed.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, label]);

  return runtime;
};
