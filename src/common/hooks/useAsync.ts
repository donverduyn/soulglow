import * as React from 'react';

const defaultUpdate = <T>(
  current: { merge?: (a: T) => void },
  optimistic: T
) => {
  console.log('defaultUpdate', current, optimistic);
  current.merge?.(optimistic);
};

export const useAsync = <T extends object>(
  getAsync: () => Promise<T>,
  optimistic: () => T = () => ({}) as T,
  updateData: (result: T, data: T) => void = defaultUpdate
) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);
  const optimisticMemo = React.useMemo(optimistic, [optimistic]);
  const [data, setData] = React.useState<T>(optimisticMemo);

  React.useEffect(() => {
    let mounted = true;
    void getAsync().then(
      (result) => {
        if (mounted) {
          updateData(result, data);
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

  // console.log({ data, error, loading })
  return { data, error, loading };
};
