import * as React from 'react';
import type { PropsOf } from '@emotion/react';
import { Layer, ManagedRuntime } from 'effect';
import type { RuntimeContext } from 'common/utils/context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

export function WithRuntime<T>(Context: RuntimeContext<T>) {
  return <P extends object>(Component: React.FC<P>) => {
    const MemoComponent = React.memo(Component);
    const Wrapped = (props: PropsOf<typeof MemoComponent>) => {
      const layer = React.useContext(Context) as unknown as Layer.Layer<T>;
      const runtime = useRuntimeFactory(layer);

      return (
        <Context.Provider value={runtime}>
          {/* @ts-expect-error EmotionJSX pragma related */}
          <MemoComponent {...props} />
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
This is both compatible with strict mode and fast refresh. 🚀
*/

const useRuntimeFactory = <T,>(layer: Layer.Layer<T>) => {
  const disposed = React.useRef(false);
  const [runtime, setRuntime] = React.useState(() =>
    ManagedRuntime.make(layer)
  );

  React.useLayoutEffect(() => {
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
