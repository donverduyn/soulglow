import { isFunction } from 'remeda';

type FnOrValue<T> = T | (() => T);

export const unwrap = <T>(fnOrValue: FnOrValue<T>) =>
  isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
