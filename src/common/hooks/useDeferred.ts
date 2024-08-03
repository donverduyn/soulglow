import * as React from 'react';

export const useDeferred = (fn: () => void, deps: unknown[] = []) =>
  React.useEffect(() => {
    const clearTimeout = setTimeout(fn, 0);
    return () => clearInterval(clearTimeout);
  }, deps);
