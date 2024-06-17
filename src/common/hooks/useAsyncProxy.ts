import * as React from 'react';

export const useAsyncProxy = <T extends Record<string, unknown>>(
  getAsync: () => Promise<T>,
  optimistic: () => T,
  updateData: (data: T, result: T) => T
) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);
  const optimisticMemo = React.useMemo(optimistic, [optimistic]);
  // this allows us to use proxied mobx objects
  const [data, setData] = React.useState<T>(optimisticMemo);

  React.useEffect(() => {
    let mounted = true;
    void getAsync().then(
      (result) => {
        if (mounted) {
          console.log('result', result);
          setData(updateData(data, result));
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
