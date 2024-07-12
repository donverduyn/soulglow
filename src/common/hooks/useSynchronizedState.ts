import React, { useSyncExternalStore } from 'react';
import { Effect, SubscriptionRef, Stream } from 'effect';

export function useSynchronizedState<T>(defaultState: T) {
  const [subscriptionRef] = React.useState(
    Effect.runSync(SubscriptionRef.make<T>(defaultState))
  );

  const value = useSyncExternalStore(
    (callback) =>
      Stream.runForEach(subscriptionRef.changes, () =>
        Effect.sync(callback)
      ).pipe(Effect.runCallback),
    () => {
      return Effect.runSync(SubscriptionRef.get(subscriptionRef));
    }
  );

  return [value, subscriptionRef] as const;
}
