interface Locatable {
  source: string;
}

interface TimeRelatable {
  timestamp: number;
}

interface EventMetadata extends Locatable, TimeRelatable {}

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
