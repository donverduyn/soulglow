// TODO: Add xstate actor to manage the state of the app

// TODO: save actor state on unmount?
// TODO: save actor state on every 10 events?
// TODO: source events on top of the actor state on mount?
// TODO: think about how to handle async events/actions, maybe save actor state on every event in local storage, at least to avoid losing async state on unmount/mount cycles.
// TODO: think about how to deal with actor logic, that depends on actor state across modules, since certain modules might not be mounted at the same time. Does this mean we have to separate the lifecycle of the actor from the lifecycle of the modules, or do we simply rely on event sourcing to create an eventually consistent state, given the order of events is irrelevant? For example, let's say a user changes the volume, but given existing eq settings, it might clip, so we show warning even though the equalizer UI is not visible. The question here is should we group this under settings and use some heuristic to avoid sibling modules to have actor logic that depends on eachother. The other question is, if for example the volume is indeed changed, we would have to source events when the eq becomes visible, to show the clipping correctly.
