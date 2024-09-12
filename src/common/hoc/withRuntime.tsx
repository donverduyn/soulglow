// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { Effect, Layer, ManagedRuntime, Runtime } from 'effect';
import type { RuntimeFiber } from 'effect/Fiber';
import { useRuntime } from 'common/hooks/useRuntimeFn';
import { type GetContextType, type RuntimeContext } from 'common/utils/context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

export const WithRuntime =
  <
    TTarget extends RuntimeContext<any>,
    TSource extends [RuntimeContext<any>, Effect.Effect<any, any, any>],
  >(
    Context: TTarget,
    getSource?: (utils: {
      attachTo: <
        R1 extends RuntimeContext<any>,
        E1 extends Effect.Effect<any, any, any>,
      >(
        Context: R1,
        effect: (
          runFork: <A, E>(
            self: Effect.Effect<A, E, GetContextType<TTarget>>,
            options?: Runtime.RunForkOptions
          ) => RuntimeFiber<A, E>
        ) => E1
      ) => void;
      inject: <
        R1 extends RuntimeContext<any>,
        D1,
        F1 extends (
          runFork: <A, E>(
            self: Effect.Effect<A, E, GetContextType<R1>>,
            options?: Runtime.RunForkOptions
          ) => RuntimeFiber<A, E>
        ) => D1,
      >(
        context: R1,
        factory: F1
      ) => void;
    }) => void
  ) =>
  <P,>(Component: React.FC<P>) => {
    const MemoComponent = React.memo(Component);
    const Wrapped = (props: P) => {
      const layer = React.useContext(Context) as unknown as Layer.Layer<
        GetContextType<TTarget>
      >;
      const targetRuntime = useRuntimeFactory(layer);
      // const targetRuntime = React.useContext(targetContext);
      const runFork = targetRuntime.runFork;

      let sourceContext: TSource[0];
      let sourceEffect: TSource[1];
      const injectedProps: Record<string, (...args: any[]) => any> = {};

      // getSource never changes so we can use hooks here
      if (getSource) {
        getSource({
          attachTo: (context, createEffect) => {
            sourceContext = context as TSource[0];
            sourceEffect = createEffect(runFork) as TSource[1];
          },
          inject: (context, factory) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const runtime = React.useContext(context);
            if (Layer.isLayer(runtime)) throw new Error('No runtime found.');
            Object.assign(injectedProps, factory(runtime!.runFork));
          },
        });

        // TODO: we have to think about what happens when attachTo is used multiple times. we need an alternative to useRuntime, that allows us to dynamically provide the context and effect.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error used before being assigned
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useRuntime(sourceContext, sourceEffect, [targetRuntime]);
      }

      return (
        <Context.Provider value={targetRuntime}>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-expect-error EmotionJSX pragma related */}
          <MemoComponent
            {...props}
            {...injectedProps}
          />
        </Context.Provider>
      );
      // return <MemoComponent {...props} {...injectedProps} />;
    };
    Wrapped.displayName = `WithConsumer`;
    return React.memo(Wrapped);
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
