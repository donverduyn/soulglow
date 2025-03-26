import * as Mobx from 'mobx';

export const createState = <T>(initialState: T) => {
  const state = Mobx.observable.box(initialState);

  const getState = () => state.get();
  const setState = Mobx.action(<U>(newState: U extends T ? U : never) =>
    state.set(newState)
  );
  return [getState, setState] as const;
};
