import * as React from 'react';
import { Effect, Exit, Scope, pipe, type ManagedRuntime } from 'effect';

export const useRuntime = <R, A, E>(
  context: React.Context<
    React.MutableRefObject<ManagedRuntime.ManagedRuntime<R, never> | null>
  >,
  effect: Effect.Effect<A, E, NoInfer<R>>
) => {
  const runtimeRef = React.useContext(context);
  React.useEffect(() => {
    const scope = Effect.runSync(Scope.make());
    void runtimeRef.current?.runPromise(
      Effect.scoped(
        pipe(
          effect,
          Effect.forkScoped,
          Scope.extend(scope),
          Effect.andThen(() =>
            Effect.addFinalizer(() => {
              return Effect.logDebug('[useRuntime] closed');
            })
          )
        )
      )
    );
    return () => {
      Effect.runFork(Scope.close(scope, Exit.void));
    };
  }, []);
};
