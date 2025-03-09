export type QueryType<R> = {
  name: string;
  payload: R;
  source: string;
  timestamp: number;
};
