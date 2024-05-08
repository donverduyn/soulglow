// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func<T> = (...args: any[]) => T;

export const memoize = <T>(
  func: Func<T | Promise<T>>
): Func<T | Promise<T>> => {
  const cache: Map<string, unknown> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memoizedFunction = (...args: any[]) => {
    const key: string = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = func(...args);
    if (result instanceof Promise) {
      return result
        .then((resolvedResult) => {
          cache.set(key, resolvedResult);
          return resolvedResult;
        })
        .catch((error: unknown) => {
          cache.delete(key);
          throw error;
        });
    } else {
      cache.set(key, result);
      return result;
    }
  };

  return memoizedFunction as Func<T | Promise<T>>;
};
