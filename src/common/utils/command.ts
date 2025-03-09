export type CommandType<R> = {
  name: string;
  payload: R;
  source: string;
  timestamp: number;
};
