import moize from 'moize';

export const memoize: MemoizeFn = moize;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MemoizeFn = <T extends (...args: any[]) => R | Promise<R>, R>(
  targetFn: T
) => T;
