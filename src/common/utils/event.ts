interface Locatable {
  source: string;
}

interface TimeRelatable {
  timestamp: number;
}

export interface EventMetadata extends Locatable, Partial<TimeRelatable> {}

export interface Publishable<R = unknown> {
  readonly publish: (value: EventType<unknown>) => R;
}

export const createEventMetadata = (source: string): EventMetadata => ({
  source,
  timestamp: Date.now(),
});

export const createEvent =
  <S extends string, T, R>(name: S, fn: (arg: T, event: EventMetadata) => R) =>
  (arg: T, meta?: EventMetadata) => {
    const eventMetadata = meta ?? createEventMetadata('unknown');
    return {
      name: name as `${S}`,
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      event: eventMetadata,
      payload: fn(arg, eventMetadata),
    };
  };

export type EventType<R, T = never, S extends string = string> = ReturnType<
  ReturnType<typeof createEvent<S, T, R>>
>;
