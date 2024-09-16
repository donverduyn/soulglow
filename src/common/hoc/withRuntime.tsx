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
        TContext extends RuntimeContext<any>,
        TEffect extends Effect.Effect<any, any, any>,
      >(
        Context: TContext,
        effect: (
          runFork: <A, E>(
            self: Effect.Effect<A, E, GetContextType<TTarget>>,
            options?: Runtime.RunForkOptions
          ) => RuntimeFiber<A, E>
        ) => TEffect
      ) => void;
      inject: <
        TContext extends RuntimeContext<any>,
        TFactory extends (
          runFork: <A, E>(
            self: Effect.Effect<A, E, GetContextType<TContext>>,
            options?: Runtime.RunForkOptions
          ) => RuntimeFiber<A, E>
        ) => ReturnType<TFactory>,
      >(
        context: TContext,
        factory: TFactory
      ) => ReturnType<TFactory>;
    }) => void
  ) =>
  // TODO: consider using a separate component that takes Context and getSource as props, and uses a render prop to render the component. This would avoid recreating the component on fast refresh. It would also allow us to use one component for injecting and attaching, and one for rendering the component after the events have been replayed.

  <P,>(Component: React.FC<P>) => {
    //
    const Wrapped: React.FC<P> = (props) => {
      const layer = React.useContext(Context) as unknown as Layer.Layer<
        GetContextType<TTarget>
      >;

      const targetRuntime = useRuntimeFactory(layer);
      const extraProps: Record<string, any> = {};

      if (getSource) {
        getSource({
          attachTo: (context, attachEffect) => {
            //* getSource never changes over the lifetime of the component
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useRuntime(
              context as TSource[0],
              attachEffect(targetRuntime.runFork) as TSource[1],
              [targetRuntime]
            );
          },
          inject: (context, injectEffect) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const runtime = React.useContext(context);
            if (Layer.isLayer(runtime)) throw new Error('No runtime found.');
            const result = injectEffect(runtime!.runFork);
            Object.assign(extraProps, result);
            return result;
          },
        });
      }

      return (
        <Context.Provider value={targetRuntime}>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-expect-error EmotionJSX pragma related */}
          <Component
            {...props}
            {...extraProps}
          />
        </Context.Provider>
      );
    };
    Wrapped.displayName = `WithRuntime`;
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
