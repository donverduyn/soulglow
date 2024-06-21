import * as React from 'react';

export const useStable = <T extends Record<string, unknown>>(object: T) =>
  React.useMemo(() => object, Object.values(object));
