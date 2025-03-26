type Kind<T> = T;

// todo: use hkt to change the kind
export type RxWrap<T> = T extends boolean
  ? Kind<boolean>
  : T extends [infer U, ...infer V]
    ? [RxWrap<U>, ...RxWrap<V>]
    : T extends object
      ? { [P in keyof T]: RxWrap<T[P]> }
      : Kind<T>;
