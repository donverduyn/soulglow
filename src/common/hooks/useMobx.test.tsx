import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { observer } from 'mobx-react-lite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMobx } from './useMobx';

describe('useMobx', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should auto bind and update reactively with observer', async () => {
    expect.hasAssertions();

    const initialValue = 5;
    const useCount = (count: number) =>
      useMobx(() => ({
        count,
        increaseCount() {
          setTimeout(() => this.count++, 100);
        },
      }));

    const TestComponent = observer(() => {
      const counter = useCount(initialValue);

      // we intentionally don't use an inline function to test auto-binding
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(counter.increaseCount, [counter]);
      return <p>{counter.count}</p>;
    });

    // Wait for the rerender
    render(<TestComponent />);
    const before = await screen.findByRole('paragraph');
    expect(parseInt(before.innerHTML)).toBe(initialValue);

    await React.act(() => vi.runAllTimers());
    const after = await screen.findByRole('paragraph');
    expect(parseInt(after.innerHTML)).toBe(initialValue + 1);
  });
});
