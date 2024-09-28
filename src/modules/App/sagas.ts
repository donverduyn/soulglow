// TODO: Add xstate actor to manage the state of the app

// TODO: save actor state on unmount?
// TODO: save actor state on every 10 events?
// TODO: source events on top of the actor state on mount?
// TODO: think about how to handle async events/actions, maybe save actor state on every event in local storage, at least to avoid losing async state on unmount/mount cycles.
// TODO: think about how to deal with actor logic, that depends on actor state across modules, since certain modules might not be mounted at the same time. Does this mean we have to separate the lifecycle of the actor from the lifecycle of the modules, or do we simply rely on event sourcing to create an eventually consistent state, given the order of events is irrelevant? For example, let's say a user changes the volume, but given existing eq settings, it might clip, so we show warning even though the equalizer UI is not visible. The question here is should we group this under settings and use some heuristic to avoid sibling modules to have actor logic that depends on eachother. The other question is, if for example the volume is indeed changed, we would have to source events when the eq becomes visible, to show the clipping correctly.

import * as Mobx from 'mobx';
import * as MobxUtils from 'mobx-utils';
import * as SagaEffect from 'redux-saga/effects';

function* AnnoyingDad() {
  while (true) {
    yield SagaEffect.put({ type: 'TURN_ON' });
    yield SagaEffect.delay(1000);
    yield SagaEffect.put({ type: 'TURN_OFF' });
    yield SagaEffect.delay(1000);
  }
}
const Lamp = (state: Mobx.IObservableValue<string>) =>
  function* () {
    while (true) {
      yield SagaEffect.take('TURN_ON');
      Mobx.runInAction(() => state.set('on'));
      yield SagaEffect.take('TURN_OFF');
      Mobx.runInAction(() => state.set('off'));
    }
  };

export function* rootSaga() {
  const state = Mobx.observable.box('off');
  Mobx.autorun(() => console.log(state.get()));
  const sagas = [AnnoyingDad, Lamp(state)];

  yield SagaEffect.all(
    sagas.map((saga) =>
      SagaEffect.spawn(function* () {
        while (true) {
          try {
            yield SagaEffect.call(saga);
            break;
          } catch (e) {
            console.log(e);
          }
        }
      })
    )
  );
}

type Arrow = { from: { id: string }; id: string; to: { id: string } };
type Box = { id: string };

const store2 = Mobx.observable<{
  arrows: Arrow[];
  boxes: Box[];
  selection: { id: string } | null;
}>({
  arrows: [],
  boxes: [],
  selection: null,
});

const states: unknown[] = [];
const serializeBox = MobxUtils.createTransformer((box: Box) => ({ ...box }));
const serializeArrow = MobxUtils.createTransformer((arrow: Arrow) => ({
  from: arrow.from.id,
  id: arrow.id,
  to: arrow.to.id,
}));

const serializeState = MobxUtils.createTransformer((store: typeof store2) => ({
  arrows: store.arrows.map(serializeArrow),
  boxes: store.boxes.map(serializeBox),
  selection: store.selection ? store.selection.id : null,
}));

Mobx.autorun(() => {
  states.push(serializeState(store2));
  console.log(states);
});

Mobx.runInAction(() =>
  store2.arrows.push({ from: { id: 'foo' }, id: 'a1', to: { id: 'bar' } })
);
