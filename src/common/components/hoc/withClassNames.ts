import React from 'react';
import type { Simplify } from 'type-fest';

export const WithClassNames =
  <P>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends Record<any, any>>(
    classNames: T,
    fn: <R>(Component: React.FC<P & { classNames: T }>) => R
  ) =>
  (Comp: React.FC<Simplify<P & { classNames: T }>>) => {
    const Wrapped: React.FC<Simplify<P>> = (props) => {
      return React.createElement(
        fn(Comp),
        Object.assign({}, props, { classNames })
      );
    };

    Wrapped.displayName = `WithClassNames(${Comp.displayName || Comp.name})`;
    return React.memo(Wrapped);
  };
