import * as React from 'react';

const defaultMerge = <T>(
  current: { merge?: (a: T) => void },
  optimistic: T
) => {
  // we should prevent merging incompatible objects, maybe structural compare
  current.merge?.(optimistic);
};

export const useAsync = <T extends object>(
  getAsync: () => Promise<T>,
  optimistic: () => T = () => ({}) as T,
  merge: (result: T, data: T) => void = defaultMerge
) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<T>(optimistic);

  React.useEffect(() => {
    let mounted = true;
    void getAsync().then(
      (result) => {
        if (mounted) {
          merge(result, data);
          setData(result);
          setLoading(false);
        }
      },
      (error: Error) => {
        if (mounted) {
          setError(error);
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  return { data, error, loading };
};
