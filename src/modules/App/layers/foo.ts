// type Arrow = { from: { id: string }; id: string; to: { id: string } };
// type Box = { id: string };

// const store2 = Mobx.observable<{
//   arrows: Arrow[];
//   boxes: Box[];
//   selection: { id: string } | null;
// }>({
//   arrows: [],
//   boxes: [],
//   selection: null,
// });

// const states: unknown[] = [];
// const serializeBox = MobxUtils.createTransformer((box: Box) => ({ ...box }));
// const serializeArrow = MobxUtils.createTransformer((arrow: Arrow) => ({
//   from: arrow.from.id,
//   id: arrow.id,
//   to: arrow.to.id,
// }));

// const serializeState = MobxUtils.createTransformer((store: typeof store2) => ({
//   arrows: store.arrows.map(serializeArrow),
//   boxes: store.boxes.map(serializeBox),
//   selection: store.selection ? store.selection.id : null,
// }));

// Mobx.autorun(() => {
//   states.push(serializeState(store2));
//   console.log(states);
// });

// Mobx.runInAction(() =>
//   store2.arrows.push({ from: { id: 'foo' }, id: 'a1', to: { id: 'bar' } })
// );
