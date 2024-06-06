import * as React from 'react';
import { Effect, Ref, flow } from 'effect';
import { runtime as $ } from 'common/hoc/runtime';
import { Count, TestButtonRuntime } from './context';

interface Props {
  foo: string;
}

const countEffect = flow(
  (value: string) => Effect.sync(() => value),
  Effect.andThen((value) =>
    Effect.gen(function* () {
      const count = yield* Count;
      const n = yield* Ref.updateAndGet(count, (value) => value + 1);
      return { count: n, value };
    })
  )
);

export const TestButton = $(TestButtonRuntime)<Props>(({ useHandler }) => {
  const count = useHandler(countEffect);
  const logCount = React.useCallback(() => {
    void count('hello').then((value) => {
      console.log(value, 'from Effect');
    });
  }, []);

  //   useInterval(logCount, 1000);
  return (
    <button
      onClick={logCount}
      type='button'
    >
      Emit Event
    </button>
  );
});
