// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoize = <T extends (a: any) => R | Promise<R>, R>(fn: T) => {
  const cache: Map<string, R> = new Map();

  const memoizedFunction = (...args: Parameters<T>) => {
    const key: string = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn.apply(null, args);
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
  return memoizedFunction as T;
};
