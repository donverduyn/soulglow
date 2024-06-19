import * as React from 'react';
import { Effect, Exit, Scope, flow, pipe } from 'effect';
import type { RuntimeContext } from 'context';

const noRuntimeMessage = `No runtime available. 
  Did you forget to wrap your component using withRuntime?
  `;

export const useRuntime = <R, A, E>(
  context: RuntimeContext<R>,
  task: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtimeRef = React.useContext(context);
  const createScope = React.useCallback(flow(Scope.make, Effect.runSync), []);

  React.useEffect(() => {
    const scope = createScope();
    void pipe(
      task,
      Effect.forkIn(scope),
      runtimeRef.current?.runPromise ??
        (() => Promise.reject(new Error(noRuntimeMessage)))
    );

    return () => {
      Effect.runFork(Scope.close(scope, Exit.void));
    };
  }, []);
  return runtimeRef;
};
