export type Message<T = object> = {
  message: string;
  payload: T;
};
