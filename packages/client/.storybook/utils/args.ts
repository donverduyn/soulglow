import type React from 'react';
import type { Simplify } from 'type-fest';

export type ExtendArgs<T> =
  T extends React.FC<infer P> ? Simplify<P & Omit<T, keyof React.FC>> : never;
