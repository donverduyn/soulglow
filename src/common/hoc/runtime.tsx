import * as React from 'react';
import { Layer, Effect, Scope, pipe, Runtime, Exit } from 'effect';

const createRuntime = async <T,>(layer: Layer.Layer<T>) => {
  const scope = Effect.runSync(Scope.make());
  const runtime = await Effect.runPromise(
    pipe(layer, Layer.toRuntime, Scope.extend(scope))
  );

  const runSync = Runtime.runSync(runtime);
  const dispose = () => Effect.runFork(Scope.close(scope, Exit.void));
  return { dispose, runSync };
};

const useEffectRuntime = <T,>(layer: Layer.Layer<T>) => {
  const create = React.useCallback(() => createRuntime(layer), [layer]);
  const ref = React.useRef<Awaited<ReturnType<typeof create>> | null>(null);

  React.useEffect(() => {
    const id = Math.round(Math.random() * 1000);
    console.log(`[useEffectRuntime] create runtime ${String(id)}`);
    console.log({ id });

    const runtime = create();
    void runtime.then((r) => (ref.current = r));
    return () => {
      void runtime.then(({ dispose }) => {
        console.log(`[useEffectRuntime] dispose runtime ${String(id)}`);
        dispose();
      });
    };
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
};

export const createRuntimeProvider = <T,>(layer: Layer.Layer<T>) => {
  const factory = () => createRuntime(layer);
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
