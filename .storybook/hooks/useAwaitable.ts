import * as React from 'react';

export const useAwaitable = <T>(awaitable: Promise<T> | T) => {
  const [code, setCode] = React.useState<T | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const resolveCode = async () => {
      if (awaitable instanceof Promise) {
        const resolvedCode = await awaitable;
        console.log('Resolved code:', resolvedCode);
        if (isMounted) setCode(resolvedCode);
      } else {
        setCode(awaitable);
      }
    };

    void resolveCode();
    return () => {
      isMounted = false;
    };
  }, [awaitable]);

  return code;
};
