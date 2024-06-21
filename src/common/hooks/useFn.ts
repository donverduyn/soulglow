import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFn = <Fn extends (...args: any[]) => void>(
  fn: Fn,
  deps: unknown[] = []
) => React.useCallback(fn, [fn, ...deps]);
