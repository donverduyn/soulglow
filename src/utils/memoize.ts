/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

type Func<T> = (...args: any[]) => T;

export function memoize<T>(func: Func<T>): Func<T> {
  const cache: Map<string, T> = new Map();

  return (...args: any[]): T => {
    const key: string = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result: T = func(...args);
    cache.set(key, result);
    return result;
  };
}
