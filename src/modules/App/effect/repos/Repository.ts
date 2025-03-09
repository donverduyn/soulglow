import { composeWithDevTools } from '@redux-devtools/extension';
import {
  applyMiddleware,
  legacy_createStore as createStore,
  type Middleware,
} from 'redux';

// import monitorReducersEnhancer from './enhancers/monitorReducers'
// import loggerMiddleware from './middleware/logger'
// import rootReducer from './reducers'

const rootReducer = <T, A>(state: T, action: A) => {
  return state;
};

const logger: Middleware = (store) => (next) => (action) => {
  // @ts-expect-error action unknown
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// const round = (number: number) => Math.round(number * 100) / 100;

// const monitorReducerEnhancer =
//   <S>(createStore: StoreCreator) =>
//   (reducer: Reducer<S, Action>, initialState?: S, enhancer?: StoreEnhancer) => {
//     const monitoredReducer: Reducer<S, Action> = (state, action) => {
//       const start = performance.now();
//       const newState = reducer(state, action);
//       const end = performance.now();
//       const diff = round(end - start);

//       console.log('Reducer process time:', diff);

//       return newState;
//     };

//     return createStore(monitoredReducer, initialState, enhancer);
//   };

export default function configureStore<T>(preloadedState: T) {
  const middlewares = [logger];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  // const enhancers = [middlewareEnhancer, monitorReducerEnhancer];
  const composedEnhancers = composeWithDevTools(middlewareEnhancer);
  const store = createStore(rootReducer, preloadedState, composedEnhancers);

  // if (process.env.NODE_ENV !== 'production' && module.hot) {
  //   module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));
  // }

  return store;
}

// this class is used as a layer in the root, so we can listen for certain events from the command and query bus and call the repository methods

// the idea is that the repository only publishes events to the event bus, after it is done with the data fetching, this happens through a callback function that is passed to the repository method

// query bus => repository => event bus
// get => fetch => publish

// command bus => repository => event bus
// add => fetch => publish
// update => fetch => publish
// delete => fetch => publish


class Repository {
  constructor() {
    this.store = configureStore({});
  }

  store: ReturnType<typeof configureStore>;

  get() {
    // if cached return cached data, otherwise fetch from api
    // and store in redux store for cache, return data afterwards
  }
}
