import type { Simplify } from 'type-fest';

export type ExtendArgs<T> =
  T extends React.FC<infer P>
    ? React.FC<Simplify<P & Omit<T, keyof React.FC>>>
    : never;
