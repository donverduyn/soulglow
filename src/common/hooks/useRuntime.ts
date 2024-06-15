import * as React from 'react';
import { Effect, Exit, Scope, pipe } from 'effect';
import type { RuntimeContext } from 'context';

export const useRuntime = <R, A, E>(
  context: RuntimeContext<R>,
  effect?: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtimeRef = React.useContext(context);
  React.useEffect(() => {
    const scope = Effect.runSync(Scope.make());
    if (effect) {
      void runtimeRef.current?.runPromise(
        Effect.scoped(
          pipe(
            effect,
            Effect.forkScoped,
            Scope.extend(scope),
            Effect.andThen(() => {
              return Effect.addFinalizer(() =>
                Effect.logDebug('[useRuntime] closed')
              );
            })
          )
        )
      );
    }
    return () => {
      Effect.runFork(Scope.close(scope, Exit.void));
    };
  }, []);
  return runtimeRef;
};
