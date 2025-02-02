import moize from 'moize';

export const memoize: MemoizeFn = moize;

type MemoizeFn = <T extends (...args: any[]) => R | Promise<R>, R>(
  targetFn: T
) => T;
