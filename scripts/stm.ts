import { Effect, TRef, STM } from 'effect';

interface State {
  readonly a: 'completed' | 'pending';
  readonly b: 'completed' | 'pending';
}

const program = Effect.gen(function* () {
  const stateRef = yield* TRef.make<State>({
    a: 'pending',
    b: 'pending',
  });

  yield* Effect.fork(
    Effect.sleep('1 second').pipe(
      Effect.andThen(() =>
        TRef.update(stateRef, (_): State => ({ ..._, a: 'completed' }))
      )
    )
  );

  yield* Effect.fork(
    Effect.sleep('1 second').pipe(
      Effect.andThen(() =>
        TRef.update(stateRef, (_): State => ({ ..._, b: 'completed' }))
      )
    )
  );

  yield* Effect.fork(
    Effect.gen(function* () {
      const wait = STM.gen(function* () {
        const state = yield* TRef.get(stateRef);
        if (state.a === 'completed' && state.b === 'completed') {
          return;
        } else {
          return yield* STM.retry;
        }
      });

      yield* Effect.log('Start...');

      yield* wait;

      yield* Effect.log('Done...');
    })
  );
}).pipe(Effect.awaitAllChildren);
