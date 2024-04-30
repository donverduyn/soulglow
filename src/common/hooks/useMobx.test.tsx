import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { observer } from 'mobx-react-lite';
import { describe, expect, it } from 'vitest';
import { useMobx } from './useMobx';

describe('useMobx', () => {
  it('should auto bind and update reactively with observer', async () => {
    expect.hasAssertions();

    const useCount = (count: number) =>
      useMobx(() => ({
        count,
        increaseCount() {
          this.count++;
        },
      }));

    const TestComponent = observer(() => {
      const counter = useCount(5);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(counter.increaseCount, [counter]);
      return <p>{counter.count}</p>;
    });

    render(<TestComponent />);

    const text = await screen.findByRole('paragraph');
    expect(text.innerHTML).toBe('6');
  });
});
