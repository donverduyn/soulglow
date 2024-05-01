import { describe, expect, it } from 'vitest';
import { memoize } from './memoize';

describe('memoize', () => {
  it('should memoize the result', () => {
    expect.hasAssertions();

    const memoizedFn = memoize((obj: Record<string, unknown>) =>
      Object.assign({}, obj)
    );

    const first = memoizedFn({ foo: 'bar' });
    const second = memoizedFn({ foo: 'bar' });

    // Assert
    expect(first).toStrictEqual(second);
  });
});
