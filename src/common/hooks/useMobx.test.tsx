// import * as React from 'react';
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useMobx } from './useMobx';

describe('useMobx', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it('should auto bind and update reactively with observer', async () => {
    expect.assertions(2);

    const initialValue = 5;
    const useCount = (count: number) =>
      useMobx(() => ({
        count,
        increaseCount() {
          this.count++;
          setTimeout(() => runInAction(() => this.count++), 100);
        },
      }));

    const TestComponent = observer(() => {
      const counter = useCount(initialValue);

      // we intentionally don't use an inline function to test auto-binding
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(counter.increaseCount, [counter]);
      return <p>{counter.count}</p>;
    });

    const screen = render(<TestComponent />);
    const before = screen.getByRole('paragraph');
    expect(parseInt(before.innerHTML)).toBe(initialValue + 1);

    // wait for the second increase
    await act(() => vi.runAllTimers());
    const after = screen.getByRole('paragraph');
    expect(parseInt(after.innerHTML)).toBe(initialValue + 2);
  });
});
