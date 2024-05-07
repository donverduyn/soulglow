//
export const memoize = <T>(func: T): T => {
  const cache: Map<string, T> = new Map();

  // @ts-expect-error not equal to T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]): T => {
    const key: string = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // @ts-expect-error not callable
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = func(...args) as T;
    cache.set(key, result);
    return result;
  };
};
