import * as React from 'react';
import type { Effect } from 'effect';
import { useOptimisticRef } from 'common/hooks/useOptimisticRef';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import type { RuntimeContext } from 'context';

export const WithContextService =
  <A, E, R>(
    Context: RuntimeContext<R>,
    Service: Effect.Effect<A, E, NoInfer<R>>,
    optimistic: () => A,
    Target: React.Context<{ current: A } | null>
  ) =>
  <P extends object>(Component: React.FC<P>) => {
    const Wrapped = (props: P) => {
      const getStore = useRuntimeFn(Context, Service);
      const ref = useOptimisticRef(() => getStore(null), optimistic);

      return (
        <Target.Provider value={ref}>
          <Component {...props} />
        </Target.Provider>
      );
    };
    return Wrapped;
  };
