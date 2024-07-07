// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import {
  Rx,
  useRxSuspenseSuccess,
  useRxValue,
  useRxSet,
} from '@effect-rx/rx-react';
import { Context, Effect, Layer } from 'effect';

interface Counter {
  readonly _: unique symbol;
}

const Counter = Context.GenericTag<Counter, Rx.Writable<number, number>>(
  'Counter'
);

const create = Rx.context();

const runtime = create(
  Layer.effect(
    Counter,
    Effect.sync(() => Rx.make(0))
  )
);

const counter = runtime.rx(() =>
  Effect.gen(function* () {
    return yield* Counter;
  })
);

const CounterDisplay = () => {
  const ref = useRxSuspenseSuccess(counter);
  return (
    <>
      <span>Count</span>
      <Display writable={ref.value} />
    </>
  );
};

interface Props {
  readonly writable: Rx.Writable<number, number>;
}

const Display: React.FC<Props> = ({ writable }) => {
  const countV = useRxValue(writable);
  return <h1>{String(countV)}</h1>;
};

const Button: React.FC<Props> = ({ writable }) => {
  const set = useRxSet(writable);
  return (
    <button
      type='button'
      onClick={() => {
        set((n) => n + 1);
      }}
    >
      Add
    </button>
  );
};

const Component = () => {
  const ref = useRxSuspenseSuccess(counter);
  return (
    <React.Suspense fallback='Loading'>
      <CounterDisplay />
      <Button writable={ref.value} />
    </React.Suspense>
  );
};

export default Component;
