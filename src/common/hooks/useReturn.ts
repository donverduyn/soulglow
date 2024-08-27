import * as React from 'react';

export const useReturn = <T extends Record<string, unknown>>(object: T) =>
  React.useMemo(() => object, Object.values(object));
