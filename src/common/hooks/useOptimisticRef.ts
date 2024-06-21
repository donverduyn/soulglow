import * as React from 'react';
import { useAsync } from './useAsync';

export const useOptimisticRef = <T>(
  getAsync: () => Promise<T>,
  optimistic: () => T
) => {
  const { data } = useAsync(getAsync, optimistic);
  const ref = React.useRef(data);

  React.useEffect(() => {
    ref.current = data;
  }, [data]);

  return ref;
};
