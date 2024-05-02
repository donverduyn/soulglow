// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func<T> = (...args: any[]) => T;

export function memoize<T>(func: Func<T>): Func<T> {
  const cache: Map<string, T> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]): T => {
    const key: string = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result: T = func(...args);
    cache.set(key, result);
    return result;
  };
}
