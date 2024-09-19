// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { Effect, Layer, ManagedRuntime } from 'effect';
import { useRuntime } from 'common/hooks/useRuntimeFn';
import { type GetContextType, type RuntimeContext } from 'common/utils/context';

/*
This HOC creates a runtime for the context and provides it to the component.
It allows any downstream components to access the runtime using the context.
*/

// TODO: think about assigning a method to the function, to obtain the provided react context objects in the hoc as an array, for testing purposes. We can separate the hoc from the pipe function and export the method as a named export.

export const WithRuntime =
  <TTarget extends RuntimeContext<any>>(
    Context: TTarget,
    getSource?: (utils: {
      from: <TContext, TEffect extends Effect.Effect<any, any, any>>(
        context: RuntimeContext<TContext>,
        linkEffect: (
          runtime: ManagedRuntime.ManagedRuntime<TContext, never>
        ) => TEffect
      ) => void;

      propsOf: <
        TContext,
        TFactory extends (
          runtime: ManagedRuntime.ManagedRuntime<TContext, never>
        ) => TResult,
        TResult,
      >(
        context: RuntimeContext<TContext>,
        injectEffect: TFactory
      ) => TResult;

      to: <TContext, TEffect extends Effect.Effect<any, any, any>>(
        context: RuntimeContext<TContext>,
        attachEffect: (
          runtime: ManagedRuntime.ManagedRuntime<GetContextType<TTarget>, never>
        ) => TEffect
      ) => void;
    }) => void
  ) =>
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
          //* getSource never changes over the lifetime of the component, so it is safe to break the rules of hooks here.

          from: (context, linkEffect) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const runtime = React.useContext(context);
            if (Layer.isLayer(runtime)) throw new Error('No runtime found.');

            const effect = linkEffect(runtime!);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useRuntime(targetRuntime, effect, [targetRuntime]);
          },

          propsOf: (context, injectEffect) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const runtime = React.useContext(context);
            if (Layer.isLayer(runtime)) throw new Error('No runtime found.');
            const result = injectEffect(runtime!);
            Object.assign(extraProps, result);
            return result;
          },

          to: (context, attachEffect) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const runtime = React.useContext(context);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useRuntime(context, attachEffect(targetRuntime), [runtime]);
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
