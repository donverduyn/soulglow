export type WithArgs<T, U> =
  T extends React.FC<infer P> ? React.FC<P & U> : never;
