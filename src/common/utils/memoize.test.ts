import { memoize } from './memoize';

describe('memoize', () => {
  it('should memoize the result', () => {
    expect.assertions(1);

    const memoizedFn = memoize((obj: Record<string, unknown>) =>
      Object.assign({}, obj)
    );

    const first = memoizedFn({ foo: 'bar' });
    const second = memoizedFn({ foo: 'bar' });

    // Assert
    expect(first).toStrictEqual(second);
  });
  it('should memoize the result of a promise', async () => {
    expect.assertions(1);

    const memoizedFn = memoize(async (obj: Record<string, unknown>) =>
      Promise.resolve(obj)
    );

    const first = await memoizedFn({ foo: 'bar' });
    const second = await memoizedFn({ foo: 'bar' });

    // Assert
    expect(first).toStrictEqual(second);
  });
});
