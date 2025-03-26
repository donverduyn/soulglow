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

// this class is used as a layer in the root, so we can listen for certain events from the command and query bus and call the repository methods

// the idea is that the repository only publishes events to the event bus, after it is done with the data fetching, this happens through a callback function that is passed to the repository method

// query bus => repository => event bus
// get => fetch => publish

// command bus => repository => event bus
// add => fetch => publish
// update => fetch => publish
// delete => fetch => publish
